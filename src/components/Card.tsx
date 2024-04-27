interface ICardProps {
    title: string;
    text: string;
}

export default function Card(props: ICardProps) {
    return (
        <div className="border border-slate-300 rounded-lg inline-block px-3 py-3 space-y-1 min-w-64">
            <p className="font-bold">{props.title}</p>
            <p>{props.text}</p>
        </div>
    )
}