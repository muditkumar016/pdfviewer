import React from 'react';
import * as RNFS from 'react-native-fs';
import Realm from 'realm';
import PdfSchema from '../schemas/PdfSchema';
import UserData from '../schemas/UserData';
import { getSize, getCreationDate, getPath } from './utils';
import {  DataProvider } from "recyclerlistview";

const schema = [PdfSchema, UserData];
const PdfContext = React.createContext();

function usePdfContext() {
    const context = React.useContext(PdfContext)
    if (!context) {
        throw new Error(`useCount must be used within a CountProvider`)
    }
    return context
}

function PdfProvider(props) {
    const [allPdfs, setAllPdfs] = React.useState(new DataProvider((r1, r2) => {
        return r1 !== r2;
    }));
    const [favPdfs, setFavPdfs] = React.useState(new DataProvider((r1, r2) => {
        return r1._id !== r2._id;
    }));
    const [recentPdfs, setRecentPdfs] = React.useState(new DataProvider((r1, r2) => {
        return r1._id !== r2._id;
    }));

    const data = {
        allPdfs: allPdfs, 
        setAllPdfs: setAllPdfs,  
        favPdfs: favPdfs, 
        setFavPdfs: setFavPdfs,
        recentPdfs: recentPdfs,
        setRecentPdfs: setRecentPdfs,
        findPDFs: findPDFs,
        getRecentPdfs: getRecentPdfs,
        getFavPdfs: getFavPdfs,
        deleteFile: deleteFile,
        renameFile: renameFile,
        copyFile: copyFile,
        moveFile: moveFile
    };
    return <PdfContext.Provider value={data} {...props} />
}

// <-------------------------- Common Methods --------------------------------------->
const getNewID = (allpdfs) => {
    let _id = -1;
    allpdfs.forEach(res => {
        if(res._id > _id) {
            _id = res._id;
        }
    }) 
    _id += 1;
    return _id;
} 

const copyFile = (pdf, path, setAllPdfs, setFavPdfs, setRecentPdfs) => {
    const newPath = path + '/' + pdf.name;
    RNFS.copyFile(pdf.path, newPath)
    .then(() => {
        if(newPath === pdf.path) {
            return;
        }
        Realm.open({
            path: "myrealm",
            schema: schema,
        }).then(realm => {
            let allpdfs = realm.objects('Pdf');
            const _id = getNewID(allpdfs);
            realm.write(() => {
                realm.create('Pdf', {
                    ...pdf,
                    _id: _id,
                    path: newPath, 
                    dir: path,
                    displayPath: getPath(path),
                    creationDate: getCreationDate(new Date()),
                    lastRead: null,
                    isFav: false,
                })
            })
            postCCDRupdate(allpdfs, setAllPdfs, setFavPdfs, setRecentPdfs);
        })
    })
    .catch(err => {
        console.log(err.message);
    }) 
}

const moveFile = (pdf, path, setAllPdfs, setFavPdfs, setRecentPdfs) => {
    const newPath = path + '/' + pdf.name;
    RNFS.moveFile(pdf.path, newPath)
    .then(() => {
        if(newPath === pdf.path) {
            return;
        }
        Realm.open({
            path: "myrealm",
            schema: schema,
        }).then(realm => {
            let curpdf = realm.objectForPrimaryKey('Pdf', pdf._id);
            realm.write(() => {
                curpdf.path = newPath,
                curpdf.dir = path,
                curpdf.displayPath = getPath(path)
            })
            const allpdfs = realm.objects('Pdf');
            postCCDRupdate(allpdfs, setAllPdfs, setFavPdfs, setRecentPdfs);
        })
    })
    .catch(err => {
        console.log(err.message);
    })
}

const deleteFile = (selectedPdf, setFavPdfs, setAllPdfs, setRecentPdfs) => {
    RNFS.unlink(selectedPdf.path)
    .then(() => {
        Realm.open({
            path: "myrealm",
            schema: schema,
        }).then(realm => {
            const pdfList = realm.objects('Pdf');
            const oldPdf = realm.objectForPrimaryKey('Pdf', selectedPdf._id);
            realm.write(() => {
                realm.delete(oldPdf)
            })       
            postCCDRupdate(pdfList, setAllPdfs, setFavPdfs, setRecentPdfs);     
        })
    })
    // `unlink` will throw an error, if the item to unlink does not exist
    .catch((err) => {
        console.log(err.message);
    });
}

// Function to update the pdf lists after Cut , Copy, Delete or, Rename
const postCCDRupdate = (pdfList, setAllPdfs, setFavPdfs, setRecentPdfs) => {
    copyData(pdfList, setAllPdfs);
    const _recentPdfs = pdfList.sorted('lastRead', true).slice(0, 10);
    let validPdfs = [];
    for(let i = 0; i < _recentPdfs.length; ++i) {
        if(_recentPdfs[i].lastRead !== null) {
            validPdfs.push(_recentPdfs[i]);
        }
        else {
            break;
        }
    }
    copyData(validPdfs, setRecentPdfs);
    copyData(pdfList.filtered('isFav == true'), setFavPdfs);
}

// Function to make a deep copy of realm pdfList into a setHook function
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

// Function to rename pdf file
const renameFile = (selectedPdf, setAllPdfs, setFavPdfs, setRecentPdfs, input) => {
    const newPath = selectedPdf.dir + '/' + input;
    RNFS.moveFile(selectedPdf.path, newPath)
        .then(() => {
            Realm.open({
                path: 'myrealm',
                schema: schema
            }).then((realm) => {
                const pdfList = realm.objects('Pdf');
                const new_id = getNewID(pdfList);
                let pdf = realm.objectForPrimaryKey('Pdf', selectedPdf._id);
                realm.write(() => {
                    pdf.path = newPath,
                    pdf.name = input
                })
                postCCDRupdate(pdfList, setAllPdfs, setFavPdfs, setRecentPdfs);
            })
        })
        .catch(err => {
            console.log(err.message)
        })
}


// <-------------------------- FileScreen Specific Functions --------------------------------->
// Function to find the pdfs
const findPDFs = async (setAllPdfs) => {
    let pdfArray = [];
    try {
        const realm = await Realm.open({
          path: "myrealm",
          schema: schema,
        });
 
        let pdfList = realm.objects("Pdf");
        let id = -1;
        pdfList.forEach(pdf => {
            if(pdf._id > id)
                id = pdf._id;
        })

        id += 1;
        if(pdfList.length === 0) {
            await GetAllPdfs(RNFS.ExternalStorageDirectoryPath, pdfArray);
            pdfArray.forEach(pdf => {
                realm.write(() => {
                    // Assign a newly-created instance to the variable.
                    realm.create("Pdf", {
                        _id: id,
                        name: pdf.name,
                        path: pdf.path,
                        size: pdf.size,
                        dir: pdf.dir,
                        displayPath: pdf.displayPath,
                        displaySize: pdf.displaySize,
                        creationDate: pdf.creationDate
                    });
                });
                id++;
            })
            
            pdfList = realm.objects('Pdf');
            copyData(pdfList, setAllPdfs);
            realm.write(() => {
                realm.create('user', {
                    _id: 0,
                    lastSearch: new Date()
                })
            })
        }
        else {
            // Update for changes
            for(let i = 0; i < pdfList.length; ++i) {
                await RNFS.exists(pdfList[i].path).then(res => {
                    if(!res) {
                        realm.write(() => {
                            realm.delete(pdfList[i]);
                        });
                    }
                })
            }
            // Get the inital updated list
            pdfList = realm.objects('Pdf');
            copyData(pdfList, setAllPdfs);

            // Finally again an exhaustive search to get all pdfs
            let isExist = {}
            pdfList.forEach(res => {
                isExist[res.path] = 1;
            }) 

            await GetAllPdfs(RNFS.ExternalStorageDirectoryPath, pdfArray, true, isExist);
            pdfArray.forEach(pdf => {
                realm.write(() => {
                    // Assign a newly-created instance to the variable.
                    realm.create("Pdf", {
                        _id: id,
                        name: pdf.name,
                        path: pdf.path,
                        size: pdf.size,
                        dir: pdf.dir,
                        displayPath: pdf.displayPath,
                        displaySize: pdf.displaySize,
                        creationDate: pdf.creationDate
                    });
                });
                id++;
            })
            pdfList = realm.objects('Pdf');
            copyData(pdfList, setAllPdfs);
        }

    } catch (err) {
        console.error("Realm opening error: ", err.message);
    } 
}


// Recursive Function for exhaustive search of directory
const GetAllPdfs = async (path, pdfArray, isUpdate = false, isExist = {}) => {

    const result = await RNFS.readDir(path)
                    .then((res) => {
                        return res;
                    })
                    .catch(err => {
                        console.log(err);
                    })

    for(let i = 0; i < result.length; ++i) {
        let res = result[i];
        if(res.name != 'Android') { 
            if(res.name.length > 4 && res.name.substr(res.name.length - 4, 4) == '.pdf') {
                if(isUpdate) {
                    if(res.path in isExist) {
                        continue;
                    }
                }
                const displayPath = getPath(path);
                const displaySize = getSize(res.size);
                const creationDate = getCreationDate(res.mtime);
                pdfArray.push({ name: res.name, 
                                path: res.path, 
                                size: res.size, 
                                dir: path,
                                displayPath: displayPath,
                                displaySize: displaySize,
                                creationDate: creationDate,
                                isFav: false,
                            });
            }
            else if(res.isDirectory())
                await GetAllPdfs(res.path, pdfArray, isUpdate, isExist);
        }
    }
}

// <-------------------- HomeScreen Specific Functions ----------------------------->

const getRecentPdfs = (setRecentPdfs) => {
    Realm.open({
        path: 'myrealm',
        schema: schema
    }).then(realm => {
        const pdfList = realm.objects('Pdf');
        if(pdfList.length !== 0) {
            const pdfs = pdfList.sorted('lastRead', true).slice(0, 10);
            let validPdfs = [];
            for(let i = 0; i < pdfs.length; ++i) {
                if(pdfs[i].lastRead !== null) {
                    validPdfs.push(pdfs[i]);
                }
                else {
                    break;
                }
            }
            copyData(validPdfs, setRecentPdfs);
        }

    })
}

// <----------------------- Fav Screen Specific Functions ----------------------------->

const getFavPdfs = (setFavPdfs, setLoading) => {
    Realm.open({
        path: "myrealm",
        schema: schema,
    }).then(realm => {
        const _favPdf = realm.objects('Pdf');
        const favPdf = _favPdf.filtered('isFav == true');
        copyData(favPdf, setFavPdfs);
    })
}

export {PdfProvider, usePdfContext, PdfContext}