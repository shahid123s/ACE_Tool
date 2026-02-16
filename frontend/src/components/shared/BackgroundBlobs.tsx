export function BackgroundBlobs() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="gradient-blob h-96 w-96 bg-primary/20 top-0 left-1/4 animate-float" />
            <div className="gradient-blob h-64 w-64 bg-secondary/15 top-1/3 right-1/4 animate-float" style={{ animationDelay: "1s" }} />
            <div className="gradient-blob h-80 w-80 bg-accent/15 bottom-0 left-1/2 animate-float" style={{ animationDelay: "2s" }} />
        </div>
    );
}
