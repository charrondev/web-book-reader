use tauri_plugin_sql::{Migration, MigrationKind};

pub fn migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "create_initial_tables",
        sql: "
CREATE TABLE IF NOT EXISTS WBR_book (
    bookID              VARCHAR(50) PRIMARY KEY,
    foreignUrl          TEXT        NOT NULL,
    title               TEXT        NOT NULL,
    coverUrl            TEXT        NULL,
    authorName          TEXT        NULL,
    dateInserted        DATETIME    DEFAULT CURRENT_TIMESTAMP,
    dateLastChapter     DATETIME    NULL,
    dateFirstChapter    DATETIME    NULL,
    dateLastRead        DATETIME    NULL,
    countChapters       INTEGER     DEFAULT 0
);

CREATE TABLE IF NOT EXISTS WBR_bookProgress (
    bookProgressID      INTEGER         PRIMARY KEY AUTOINCREMENT,
    bookID              VARCHAR(50)     NOT NULL,
    currentChapter      INTEGER         NOT NULL,
    currentPage         INTEGER         NULL,
    currentOffset       INTEGER         NULL
);

CREATE TABLE IF NOT EXISTS WBR_bookTag (
    bookID      VARCHAR(50)     NOT NULL,
    tagName     VARCHAR(500)    NOT NULL,
    PRIMARY KEY (bookID, tagName)
);

CREATE TABLE IF NOT EXISTS WBR_chapter (
    chapterID       VARCHAR(50)                                                   PRIMARY KEY,
    bookID          VARCHAR(50)                                                   NOT NULL,
    foreignUrl      TEXT                                                          NOT NULL,
    title           TEXT                                                          NOT NULL,
    status          TEXT CHECK(status IN ('downloaded', 'pending', 'error'))      NOT NULL,
    datePublished   DATETIME                                                      NOT NULL,
    dateInserted    DATETIME                                                      DEFAULT CURRENT_TIMESTAMP,
    dateUpdated     DATETIME                                                      DEFAULT CURRENT_TIMESTAMP,
    content         TEXT                                                          NOT NULL,
    noteBefore      TEXT                                                          NULL,
    noteAfter       TEXT                                                          NULL
);

",
        kind: MigrationKind::Up,
    }]
}
