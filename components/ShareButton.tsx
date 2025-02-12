import React, { useState, useRef, useEffect } from 'react'
import { ShareIcon, ChevronDown, DownloadIcon } from 'lucide-react'
import { XLogo } from '@phosphor-icons/react'
import toast from 'react-hot-toast'

interface ShareButtonProps {
  getImage?: () => Promise<string | null>;
  shareId?: string | null;
  getShareUrl?: () => string;
}

export default function ShareButton({ getImage, shareId, getShareUrl }: ShareButtonProps) {
  // Compute the share URL.
  // Priority: custom URL from getShareUrl, else use the shareId to construct a URL pointing to /a/[id],
  // otherwise fall back to window.location.href or a default URL.
  let shareUrl = ''
  if (getShareUrl) {
    shareUrl = getShareUrl()
  } else if (shareId) {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://aura-checker.vercel.app'
    shareUrl = `${origin}/a/${shareId}`
  } else if (typeof window !== 'undefined') {
    shareUrl = window.location.href
  } else {
    shareUrl = 'https://aura-checker.vercel.app/'
  }

  // Build the Post on X URL with proper text encoding
  const xShareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
    `Check your Aura now: ${shareUrl}`
  )}`

  // Dropdown open state
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [containerRef])

  // Handle native share
  const handleShare = async () => {
    try {
      // If an image is available, try to attach it in the native share.
      if (getImage) {
        const imageUrl = await getImage()
        if (imageUrl) {
          const response = await fetch(imageUrl)
          const blob = await response.blob()
          const file = new File([blob], 'aura-comparison.png', {
            type: blob.type || 'image/png',
          })
          
          // If the browser supports sharing files, use that method.
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Aura Comparison',
              text: 'Check out this Aura Comparison!',
            })
            return
          }
  
          // Fallback: if file share isn't supported, share the URL.
          if (navigator.share) {
            await navigator.share({
              title: 'Aura Comparison',
              text: 'Check out this Aura Comparison!',
              url: shareUrl,
            })
            return
          }
          
          // Fallback to clipboard if Web Share is not available.
          await navigator.clipboard.writeText(shareUrl)
          toast.success('Link copied to clipboard!')
          return
        }
      }
  
      // If no image is provided or image sharing failed, just share the text URL.
      if (navigator.share) {
        await navigator.share({
          title: 'Check your Aura now',
          text: 'Check your Aura now',
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(`Check your Aura now: ${shareUrl}`)
        toast.success('Link copied to clipboard')
      }
    } catch (error) {
      console.error('Error sharing:', error)
      toast.error('Failed to share')
    }
  }

  // Handle image download option
  const handleDownload = async () => {
    try {
      if (getImage) {
        const imageUrl = await getImage()
        if (imageUrl) {
          const response = await fetch(imageUrl)
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const anchor = document.createElement('a')
          anchor.href = url
          anchor.download = 'aura-comparison.png'
          document.body.appendChild(anchor)
          anchor.click()
          anchor.remove()
          window.URL.revokeObjectURL(url)
          toast.success('Download initiated!')
          return
        }
      }
      toast.error('Image not available for download!')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download image')
    }
  }

  return (
    <div className="text-[#A6ACD8] text-sm flex items-center gap-2">
      <div ref={containerRef} className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 h-9 justify-center rounded-l-3xl rounded-r-md px-4 bg-[#666C94]/20 hover:brightness-125 focus:outline-none transition-all duration-200"
        >
          <ShareIcon className="w-4 h-4" />
          <span>Share</span>
          <ChevronDown 
            className={`w-3 h-3 transition-transform duration-200 ${
              dropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {dropdownOpen && (
          <div className="absolute left-0 mt-2 w-56 rounded-lg shadow-lg bg-[#1F2433] border border-[#666C94]/20 backdrop-blur-xl z-50 overflow-hidden">
            <div>
              <button
                onClick={() => {
                  handleShare()
                  setDropdownOpen(false)
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white hover:bg-[#293040] transition-colors duration-200"
              >
                <ShareIcon className="w-4 h-4 text-[#666C94]" />
                Share on Device
              </button>
              <button
                onClick={() => {
                  handleDownload()
                  setDropdownOpen(false)
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white hover:bg-[#293040] transition-colors duration-200"
              >
                <DownloadIcon className="w-4 h-4 text-[#666C94]" />
                Download Image
              </button>
            </div>
          </div>
        )}
      </div>

      <a
        href={xShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 h-9 rounded-r-3xl rounded-l-md px-4 bg-[#666C94]/20 hover:brightness-125 transition-all duration-200"
      >
        <XLogo className="w-4 h-4" />
        Post on X
      </a>
    </div>
  )
}