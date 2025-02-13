import React from 'react'

function CardRightSideCover({ ...props }: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} width="136" height="549" preserveAspectRatio="none" viewBox="0 0 136 549" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 30.712C7.41423e-07 13.7502 13.7503 -7.41424e-07 30.7121 0C42.129 4.99051e-07 52.6037 6.33313 57.9081 16.4431L125.926 146.081C132.543 158.693 136 172.723 136 186.966L136 362.034C136 376.277 132.543 390.307 125.926 402.919L57.9081 532.557C52.6037 542.667 42.129 549 30.7121 549C13.7503 549 1.33109e-05 535.25 1.17519e-05 518.288L0 30.712Z" fill="white" fill-opacity="0.05" />
        </svg>
    )
}

function CardLeftSideCover({ ...props }: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} width="136" height="549" preserveAspectRatio="none" viewBox="0 0 136 549" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M136 30.712C136 13.7502 122.25 -7.41424e-07 105.288 0C93.871 4.99051e-07 83.3963 6.33311 78.0919 16.443L10.0745 146.081C3.45714 158.693 1.61836e-05 172.723 1.68062e-05 186.966L0 362.034C-3.35718e-06 376.277 3.45712 390.307 10.0745 402.919L78.0919 532.557C83.3963 542.667 93.871 549 105.288 549C122.25 549 136 535.25 136 518.288V30.712Z" fill="white" fill-opacity="0.05" />
        </svg>
    )
}



export { CardRightSideCover, CardLeftSideCover }