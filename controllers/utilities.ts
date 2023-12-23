export function getIDFromLink(link: string): string {
    let pieces = link.split("/");
    if (pieces.length < 6) return "";
    return pieces[5];
}