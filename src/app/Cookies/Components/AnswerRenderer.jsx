import MiniNote from "./MiniNote";
import Callout from "./Callout";
export default function AnswerRenderer({ answer }) {
    // ✅ simplest case: answer is just a string
    if (typeof answer === "string") {
        return <p>{answer}</p>;
    }
    // ✅ rich blocks: paragraphs, lists, callout, etc.
    if (answer?.type === "rich" && Array.isArray(answer?.blocks)) {
        return (
            <div className="space-y-4">
                {answer.blocks.map((b, i) => {
                    if (b.type === "p") return <p key={i}>{b.text}</p>;
                    if (b.type === "ul") {
                        return (
                            <ul key={i} className="mt-3 list-disc space-y-2 pl-6">
                                {(b.items || []).map((it, idx) => (
                                    <li key={idx}>{it}</li>
                                ))}
                            </ul>
                        );
                    }
                    if (b.type === "callout") {
                        return <Callout key={i}>{b.text}</Callout>;
                    }
                    return null;
                })}
            </div>
        );
    }
    // ✅ grid notes (like your "Types of Cookies")
    if (answer?.type === "gridNotes" && Array.isArray(answer?.items)) {
        return (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {answer.items.map((it, idx) => (
                    <MiniNote key={idx} title={it.title}>
                        {it.text}
                    </MiniNote>
                ))}
            </div>
        );
    }
    // fallback
    return <p>—</p>;
}