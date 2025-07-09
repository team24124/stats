import { LoadingSpinner } from "./ui/loading-spinner";

function Loading() {
    return (
        <main className="flex justify-center items-center flex-col">
            <LoadingSpinner />
            <p>Loading data... this might take a while.</p>
        </main>
    );
}

export default Loading;


