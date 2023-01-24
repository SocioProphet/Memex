export interface BookmarksInterface {
    addPageBookmark(args: {
        url?: string
        fullUrl: string
        timestamp?: number
        tabId?: number
    }): Promise<any>

    delPageBookmark(args: { url: string }): Promise<any>
    pageHasBookmark(url: string): Promise<boolean>
    getBookmarkTime(url: string): Promise<Object>
    setBookmarkStatusInBrowserIcon(value: boolean, PageUrl: string): void
}
