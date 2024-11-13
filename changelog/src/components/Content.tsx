import "./Content.css";
import { useState } from "react";
import parse from 'html-react-parser';
interface Props {
    version: string;
}

import showdown from "showdown";

async function fetchContent(version: string): Promise<Response> {
    const content = await fetch(`/releases/${version}/changelog.md`);
    return content;
}

function Content({ version }: Props) {
    const [fetched, completeFetch] = useState(false);
    const [htmlContent, updateContent] = useState(`<p></p>`);
    fetchContent(version).then(data => {
        if(!data.ok) {
            updateContent(`<p className="error">Couldn't load changelog. Please try again later</p>`);
            return "error";
        } else {
            return data.text();
        }
    }).then(response => {
        if(response === "error" || (response?.[0] ?? "<") === "<") {
            updateContent(`<p className="error">Couldn't load changelog. Please try again later</p>`);
        } else {
            const converter = new showdown.Converter();
            updateContent(converter.makeHtml(response));
        };
        completeFetch(true);
    });

    if(!fetched) {
        return (
            <p className="fetch">Fetching {version}...</p>
        )
    } else {
        return (
            <div className="content-container">
                {parse(htmlContent)}
            </div>
        )
    }
}

export default Content;