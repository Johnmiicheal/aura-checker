import React from 'react'

function CardTopLeftCover({ ...props }: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} width="165" height="162" viewBox="0 0 165 162" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.5">
                <path d="M164.5 36.902V-4C164.5 -10.6274 159.127 -16 152.5 -16H-12C-18.6274 -16 -24 -10.6274 -24 -4V150C-24 156.627 -18.6274 162 -12 162H39.402C46.8281 162 53.95 159.05 59.201 153.799L156.299 56.701C161.55 51.45 164.5 44.3281 164.5 36.902Z" fill="white" fillOpacity="0.1" />
                <path d="M162.5 36.902V-4C162.5 -9.52285 158.023 -14 152.5 -14H-12C-17.5228 -14 -22 -9.52285 -22 -4V150C-22 155.523 -17.5228 160 -12 160H39.402C46.2976 160 52.9109 157.261 57.7868 152.385L154.885 55.2868C159.761 50.4109 162.5 43.7976 162.5 36.902Z" stroke="white" strokeOpacity="0.1" strokeWidth="4" />
            </g>
        </svg>

    )
}

function CardTopRightCover({ ...props }: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} width="165" height="162" viewBox="0 0 165 162" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.5">
                <path d="M0 36.902V-4C0 -10.6274 5.37259 -16 12 -16H176.5C183.127 -16 188.5 -10.6274 188.5 -4V150C188.5 156.627 183.127 162 176.5 162H125.098C117.672 162 110.55 159.05 105.299 153.799L8.20101 56.701C2.94999 51.45 0 44.3281 0 36.902Z" fill="white" fill-opacity="0.1" />
                <path d="M2 36.902V-4C2 -9.52285 6.47716 -14 12 -14H176.5C182.023 -14 186.5 -9.52285 186.5 -4V150C186.5 155.523 182.023 160 176.5 160H125.098C118.202 160 111.589 157.261 106.713 152.385L9.61522 55.2868C4.73928 50.4109 2 43.7976 2 36.902Z" stroke="white" stroke-opacity="0.1" stroke-width="4" />
            </g>
        </svg>

    )
}

export { CardTopLeftCover, CardTopRightCover }