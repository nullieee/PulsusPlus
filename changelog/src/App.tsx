import Header from "./components/Header";
import Content from "./components/Content";
import UpdateList from "./components/UpdateList";
import { useState } from "react";

function App() {
    // check to see Where we are on the page
    const search = new URLSearchParams(location.search);
    if(search.size === 0) {
        /*
        otherwise, mode=release along with &version=VERSION_NAME
        */
        location.search = "mode=search";
    };
    let initialState: Array<string>;
    if(search.get("version") === null && search.get("mode") !== "release" && search.get("mode") === "search") {
        initialState = ["all", ""];
    } else {
        initialState = ["changelog", search.get("version") || ""];
    };
    

    // other boring stuff
    const [showState, updateShowState] = useState(initialState);
    function releaseChange(target: string) {
        if(target === "showPrevious") {
            updateShowState(["all", ""]);
            location.search = "mode=search";
        } else {
            updateShowState(["changelog", target]);
            location.search = "mode=release&version=" + target;
        };
        return;
    };
    if(showState[0] === "changelog") {
        return (
            <main>
                <Header version={showState[1]} onPreviousClick={releaseChange} />
                <Content version={showState[1]} />
            </main>
        );
    } else {
        return (
            <main>
                <Header version="search" onPreviousClick={releaseChange} />
                <UpdateList onClick={releaseChange}/>
            </main>
        )
    }
}

export default App;