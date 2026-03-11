import { useEffect } from 'react';

interface PageMetaProps {
    title: string;
    description?: string;
}

export function PageMeta({ title, description = 'ACE Student & Admin Portal' }: PageMetaProps) {
    useEffect(() => {
        // Update title
        document.title = `${title} | ACE`;

        // Update description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', description);

        // Update favicon
        let linkIcon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (!linkIcon) {
            linkIcon = document.createElement('link');
            linkIcon.rel = 'icon';
            document.head.appendChild(linkIcon);
        }
        linkIcon.type = 'image/png';
        linkIcon.href = '/ace-logo.png';

        // Cleanup function not strictly necessary for title/favicon, 
        // as the next PageMeta will override it, but good practice.
    }, [title, description]);

    return null; // This component doesn't render anything visible
}
