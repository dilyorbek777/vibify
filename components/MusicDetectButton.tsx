'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { detectSong } from '@/lib/shazam-api'
import { addDetectedSong } from '@/lib/local-storage'

export function MusicDetectButton() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const router = useRouter()

  const convertToPCM = async (audioBuffer: AudioBuffer): Promise<ArrayBuffer> => {
    const numberOfChannels = 1 // Mono
    const sampleRate = 44100
    const bitsPerSample = 16
    
    console.log('Audio Format Conversion:')
    console.log(`- Sample Rate: ${sampleRate}Hz`)
    console.log(`- Channels: ${numberOfChannels} (Mono)`)
    console.log(`- Bits per Sample: ${bitsPerSample} (signed 16-bit PCM)`)
    console.log(`- Byte Order: Little Endian`)
    
    // Calculate the number of samples needed for 3-5 seconds
    const duration = Math.min(audioBuffer.duration, 5) // Max 5 seconds
    const numberOfSamples = Math.floor(sampleRate * duration)
    
    console.log(`- Duration: ${duration.toFixed(2)}s`)
    console.log(`- Number of Samples: ${numberOfSamples}`)
    
    // Create offline context for resampling
    const offlineContext = new OfflineAudioContext(
      numberOfChannels,
      numberOfSamples,
      sampleRate
    )
    
    // Create buffer source
    const source = offlineContext.createBufferSource()
    source.buffer = audioBuffer
    
    // Connect to destination
    source.connect(offlineContext.destination)
    source.start(0)
    
    // Render
    const renderedBuffer = await offlineContext.startRendering()
    
    // Convert to 16-bit PCM
    const channelData = renderedBuffer.getChannelData(0)
    const pcmData = new Int16Array(channelData.length)
    
    for (let i = 0; i < channelData.length; i++) {
      // Convert float (-1 to 1) to 16-bit integer (-32768 to 32767)
      const sample = Math.max(-1, Math.min(1, channelData[i]))
      pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
    }
    
    console.log(`- PCM Buffer Size: ${pcmData.buffer.byteLength} bytes`)
    
    return pcmData.buffer
  }

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })
      
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        setIsRecording(false)
        setIsProcessing(true)
        
        try {
          // Create blob from chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          const arrayBuffer = await audioBlob.arrayBuffer()
          
          // Decode audio
          const audioContext = new AudioContext()
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
          
          // Convert to PCM
          const pcmBuffer = await convertToPCM(audioBuffer)
          
          // Convert to base64
          const base64Data = arrayBufferToBase64(pcmBuffer)
          
          // Check size (should be < 500KB)
          const sizeKB = pcmBuffer.byteLength / 1024
          console.log(`Audio size: ${sizeKB.toFixed(2)} KB`)
          
          if (sizeKB > 500) {
            console.warn('Audio sample too large, may need to reduce duration')
          }
          
          // Detect song
          const result = await detectSong(base64Data)
          
          if (result && result.results?.matches && result.results.matches.length > 0) {
            // Save to localStorage
            const detectedSong = addDetectedSong(result)
            console.log('Saved detected song:', detectedSong.id)
            
            // Navigate to detected-song page
            router.push(`/music/${detectedSong.id}`)
          } else {
            console.log('No song detected')
            alert('Could not identify the song. Please try again.')
          }
        } catch (error) {
          console.error('Error processing audio:', error)
          alert('Failed to process audio. Please try again.')
        } finally {
          setIsProcessing(false)
          
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop())
        }
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      
      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop()
        }
      }, 5000)
      
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please ensure microphone permissions are granted.')
    }
  }, [router])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const handleClick = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  return (
    <Button
      onClick={handleClick}
      disabled={isProcessing}
      className={`relative cursor-pointer ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
      size="icon"
    >
      {isProcessing ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isRecording ? (
        <>
          <MicOff className="h-5 w-5" />
          <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
        </>
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  )
}
