import FilterContent from "./FilterContent";

export default function FilterSidebar(props) {
    return (
        <aside className="hidden lg:block border rounded-lg p-4 h-fit">
            <FilterContent {...props} />
        </aside>
    );
}
