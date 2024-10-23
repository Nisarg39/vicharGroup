import Image from 'next/image'

function VicharApp() {
    return (
        <a href="https://play.google.com/store/apps/details?id=com.vichareducation.jee_neet" target="_blank" rel="noopener noreferrer" style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 1000,
            borderRadius: '50%',
            border: '2px solid #000',
            overflow: 'hidden',
            width: '100px',
            height: '100px',
            display: 'block'
        }}>
            <Image
                src="/vicharlogo.png"
                alt="Vichar App Logo"
                width={100}
                height={100}
                style={{
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%'
                }}
            />
        </a>
    )
}

export default VicharApp