import { ShareIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import toast from 'react-hot-toast'

interface ShareButtonProps {
    getImage?: () => Promise<string | null>;
    shareId?: string | null;
    getShareUrl?: () => string;
}

export default function ShareButton({ getImage, getShareUrl }: ShareButtonProps) {
    const handleShare = async () => {
        if (getImage) {
            const imageUrl = await getImage();
            if (imageUrl) {
                const shareUrl = getShareUrl ? getShareUrl() : window.location.href;

                // Try native share API first
                if (navigator.share) {
                    const blob = await (await fetch(imageUrl)).blob();
                    const file = new File([blob], 'aura-comparison.png', { type: 'image/png' });
                    await navigator.share({
                        files: [file],
                        title: 'Aura Comparison',
                        text: 'Check out this Aura Comparison!',
                        url: shareUrl
                    });
                } else {
                    // Fallback to clipboard
                    await navigator.clipboard.writeText(shareUrl);
                    toast.success('Link copied to clipboard!');
                }
            }
        } else {
            if (typeof navigator !== 'undefined') {
                const shareUrl = getShareUrl ? getShareUrl() : 'https://aura-checker.vercel.app/';

                if (navigator.share) {
                    navigator.share({
                        title: 'Check your Aura now',
                        text: 'Check your Aura now',
                        url: shareUrl
                    })
                } else {
                    navigator.clipboard.writeText(`Check your Aura now: ${shareUrl}`)
                    toast('Copied to clipboard')
                }
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