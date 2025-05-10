import { Skeleton } from "@radix-ui/themes";
import { HtmlContentLoader } from "../ui/HtmlContent.Loader";
import { Placeholder } from "../ui/SkeletonContext";

export function ReaderPageLoader(props: { height: number; width: number }) {
    const { height, width } = props;
    return (
        <div
            css={{
                position: "relative",
            }}
        >
            <HtmlContentLoader
                countWords={60}
                css={{
                    height: height,
                    minHeight: height,
                    maxHeight: height,
                    overflow: "hidden",
                    width: width,
                }}
            />
            <div
                css={{
                    position: "absolute",
                    top: "calc(100% + 12px)",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    fontWeight: "bold",
                    fontSize: 12,
                }}
            >
                <Placeholder isLoading>Page 42</Placeholder>
            </div>
        </div>
    );
}
