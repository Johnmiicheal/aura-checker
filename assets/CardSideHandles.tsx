import React from 'react'

function CardLeftSideHandles({ ...props }: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} width="136" height="549" viewBox="0 0 136 549" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M136 30.712C136 13.7502 122.25 -7.41424e-07 105.288 0C93.8709 4.99051e-07 83.3962 6.33313 78.0918 16.4431L10.0744 146.081C3.45704 158.693 -8.4569e-05 172.723 -8.39464e-05 186.966L-0.00012207 362.034C-0.000121448 376.277 3.45702 390.307 10.0744 402.919L78.0918 532.557C83.3962 542.667 93.8709 549 105.288 549C122.25 549 136 535.25 136 518.288L136 30.712Z" fill="#B1C5FF" fill-opacity="0.05" />
        </svg>
    )
}

function CardRightSideHandles({ ...props }: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} width="136" height="549" viewBox="0 0 136 549" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 30.712C7.41423e-07 13.7502 13.7503 -7.41424e-07 30.7121 0C42.129 4.99051e-07 52.6037 6.33313 57.9081 16.4431L125.926 146.081C132.543 158.693 136 172.723 136 186.966L136 362.034C136 376.277 132.543 390.307 125.926 402.919L57.9081 532.557C52.6037 542.667 42.129 549 30.7121 549C13.7503 549 1.33109e-05 535.25 1.17519e-05 518.288L0 30.712Z" fill="#B1C5FF" fill-opacity="0.05" />
        </svg>
    )
}

export { CardLeftSideHandles, CardRightSideHandles }