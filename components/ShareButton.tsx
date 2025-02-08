import { ShareIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import toast from 'react-hot-toast'

function ShareButton() {

    const handleShare = () => {
        if (typeof navigator !== 'undefined') {
            if (navigator.share) {
                navigator.share({
                    title: 'Check your Aura now',
                    text: 'Check your Aura now',
                    url: 'https://aura-checker.vercel.app/'
                })
            } else {
                navigator.clipboard.writeText('Check your Aura now: https://aura-checker.vercel.app/')
                toast('Copied to clipboard')
            }
        }
    }

    return (
        <div className='text-[#A6ACD8] text-sm flex items-center gap-2'>
            <button
                onClick={handleShare}
                className='flex items-center gap-2 h-9 justify-center rounded-l-3xl rounded-r-md w-[90px] bg-[#666C94]/20 hover:brightness-125 twitter-share-button'
            >
                <ShareIcon className='w-4 h-4' />
                Share
            </button>
            <Link
                href={'https://x.com/share?text=Check your Aura now: '}
                target='_blank'
                className='flex items-center gap-2 h-9 rounded-r-3xl rounded-l-md justify-center w-[90px] bg-[#666C94]/20 hover:brightness-125'>
                Post on X
            </Link>
        </div>
    )
}

export default ShareButton