export default function Arrow({ width, height, className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} width={width || 24} height={height || 24} viewBox="0 0 24 24" fill="none">
            <g clip-path="url(#clip0_429_11260)">
                <path d="M12 19L12 5" stroke="#292929" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 12L12 19L19 12" stroke="#292929" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <defs>
                <clipPath id="clip0_429_11260">
                    <rect width="24" height="24" fill="white" />
                </clipPath>
            </defs>
        </svg>
    )
}