import React from 'react'

function GradientBackground({ children }: { children: React.ReactNode }) {
    return (
        <div className='min-h-screen w-screen overflow-hidden bg-[#141720] text-white'>

            <div className='fixed top-0 left-0 right-0 bottom-0 z-50 mx-auto' style={{pointerEvents: 'none'}}>
                {/* left ray */}
                <svg width="1512" height="2024" className='absolute -top-[100vh] md:top-0 w-screen md:w-auto' viewBox="0 0 1512 2024" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g style={{ mixBlendMode: 'plus-lighter', opacity: '0.4', filter: 'url(#filter0_f_1_31)' }}>
                        <path d="M-239.218 -1035.55L1348.56 1810.93L-788.112 -785.143L-239.218 -1035.55Z" fill="url(#paint0_linear_1_31)" />
                    </g>
                    <defs>
                        <filter id="filter0_f_1_31" x="-1088.11" y="-1335.55" width="2736.67" height="3446.48" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                            <feFlood flood-opacity="0" result="BackgroundImageFix" />
                            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                            <feGaussianBlur stdDeviation="150" result="effect1_foregroundBlur_1_31" />
                        </filter>
                        <linearGradient id="paint0_linear_1_31" x1="-198.603" y1="-764.312" x2="1169.89" y2="1419.23" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#8E97FF" />
                            <stop offset="1" stop-color="#8E97FF" stop-opacity="0" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* right ray */}
                <svg width="1512" height="2024" className='absolute right-0 -top-[100vh] md:top-0 w-screen md:w-auto' viewBox="0 0 1512 2024" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g style={{ mixBlendMode: 'plus-lighter', opacity: '0.3', filter: 'url(#filter0_f_1_32)' }}>
                        <path d="M1647.03 -1035.55L59.2588 1810.93L2195.93 -785.143L1647.03 -1035.55Z" fill="url(#paint0_linear_1_32)" />
                    </g>
                    <defs>
                        <filter id="filter0_f_1_32" x="-240.741" y="-1335.55" width="2736.67" height="3446.48" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                            <feFlood flood-opacity="0" result="BackgroundImageFix" />
                            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                            <feGaussianBlur stdDeviation="150" result="effect1_foregroundBlur_1_32" />
                        </filter>
                        <linearGradient id="paint0_linear_1_32" x1="1606.42" y1="-764.312" x2="237.924" y2="1419.23" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#8E97FF" />
                            <stop offset="1" stop-color="#8E97FF" stop-opacity="0" />
                        </linearGradient>
                    </defs>
                </svg>

            </div>

            {children}

        </div>
    )
}

export default GradientBackground