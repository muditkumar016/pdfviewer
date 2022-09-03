const PdfSchema = {
    name: 'Pdf',
    properties: {
        _id: 'int',
        name: 'string',
        path: 'string',
        dir: 'string',
        displayPath: 'string',
        displaySize: 'string',
        isVertical: { type: 'bool', default: true },
        isSinglePage: { type: 'bool', default: false },
        creationDate: 'string',
        lastRead: 'date?',    // Later might be used to detect rarely used pdfs
        size: 'int',
        isFav: { type: 'bool', default: false },
        lastReadPage: 'int?',
        isDarkMode: { type: 'bool', default: false },
    },
    primaryKey: '_id',
}

export default PdfSchema;