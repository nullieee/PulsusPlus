import "./UpdateList.css";
import { useState } from "react";

interface Props {
    onClick: (version: string) => void;
}

async function fetchUpdates() {
    const data = await fetch("/release-list.txt");
    return (await data.text()).split(/\r\n|\n/);
}

let releases: Array<string>;

function UpdateList({ onClick }:Props) {
    const [fetched, updateFetch] = useState(false);
    fetchUpdates().then(data => {
        releases = data;
        updateFetch(true);
    })

    if(!fetched) {
        return (
            <p className="fetch">Fetching all releases...</p>
        )
    } else {
        return (
            <div className="release-list">
                {releases.map(release => (
                    <button key={release} onClick={() => onClick(release)} className="link version list-item">{release}</button>
                ))}
            </div>
        )
    }
};

export default UpdateList;