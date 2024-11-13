import './Header.css'
interface Props {
    version: string;
    onPreviousClick: (target: string) => void;
}

function Header({ version, onPreviousClick }: Props) {
    let rightHeading;
    if(version === "search") {
        rightHeading = <a className="link version blank">Searching...</a>;
    } else {
        rightHeading = <a className="link version" href={`https://github.com/nullieee/PulsusPlus/releases/tag/${version}`} target='blank'>{version}</a>;
    }
    return (<div className="header-container">
        <h1 className="header">
            <a className="link github" href='https://github.com/nullieee/PulsusPlus' target='blank'>PulsusPlus</a>
            <span></span>
            {rightHeading}
        </h1>
        <h2 className="header subheading">
            Check out all update logs <button onClick={() => onPreviousClick("showPrevious")} className="link version">here</button>!
        </h2>
    </div>)
};

export default Header;