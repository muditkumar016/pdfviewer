import Realm, { User } from "realm";
import PdfSchema from "../schemas/PdfSchema";
import UserData from "../schemas/UserData";
import { DataProvider } from "recyclerlistview";

const schema = [PdfSchema, UserData]

const MONTHS = [
    'Jan','Feb','Mar','Apr',
    'May','Jun','Jul','Aug',
    'Sep','Oct','Nov','Dec'
];

const copyData = (pdfList, setHook) => {
    let pdfArray = [];
    for(let i = 0; i < pdfList.length; ++i) {
        pdfArray.push({
            _id: pdfList[i]._id,
            name: pdfList[i].name,
            path: pdfList[i].path,
            dir: pdfList[i].dir,
            size: pdfList[i].size,
            displaySize: pdfList[i].displaySize,
            displayPath: pdfList[i].displayPath,
            creationDate: pdfList[i].creationDate,
            lastRead: pdfList[i].lastRead,
            isFav: pdfList[i].isFav,
        })
    }

    // setHook(prev => prev.cloneWithRows(pdfArray));
    setHook(new DataProvider((r1, r2) => {
        return r1 !== r2;
    }).cloneWithRows(pdfArray));
}

const getSortedList = (prop, order, screen, realm) => {
    if(screen == 'fav') {
        return realm.objects('Pdf').filtered('isFav == true').sorted(prop, order == -1 ? false: true);
    }
    else {
        return realm.objects('Pdf').sorted(prop, order == -1 ? false: true);
    }
    
}

export const SortingFunction = (setHook, sortType, order, screen = "all") => {
    switch(sortType) {
        // Sort by name
        case 0:
            Realm.open({
                path: 'myrealm',
                schema: schema
            }).then(realm => {
                const sortedList = getSortedList('name', order, screen, realm);
                copyData(sortedList, setHook)
            })
            break;
        // Sort By Size
        case 1:
            Realm.open({
                path: 'myrealm',
                schema: schema
            }).then(realm => {
                const sortedList = getSortedList('size', order, screen, realm);
                copyData(sortedList, setHook)
            })
            break;
    }
}

export const getPath = (path) => {
    let filePath = path.split('/');
    if(filePath.length >= 5)
        filePath = filePath[4];
    else
        filePath = path;
    return filePath;
}

export const getSize = (size) => {
    let sz = Number(size);
    let unit = 'Byte';
    if(sz > 1024) {
        sz = sz / 1024;
        unit = 'KB';
    }
    
    if(sz > 1024) {
        sz = sz / 1024;
        unit = 'MB';
    }

    if(sz > 1024) {
        sz = sz / 1024;
        unit = 'GB';
    }

    sz = sz.toFixed(1);
    return sz.toString() + ' ' + unit;
}

export const getCreationDate = (date) => {
    date = new Date(date);
    return MONTHS[date.getMonth()] + ' ' + date.getDate() + ',' + ' ' + date.getFullYear();
}