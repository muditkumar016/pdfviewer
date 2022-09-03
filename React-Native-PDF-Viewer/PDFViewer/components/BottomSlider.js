import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Modal
} from 'react-native';
import { Card, withTheme, IconButton, Divider, Paragraph } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Realm from 'realm';
import PdfSchema from '../schemas/PdfSchema';
import UserData from '../schemas/UserData';
import { usePdfContext } from './Context';
import Share from 'react-native-share';

const schema = [PdfSchema, UserData];
const ICON_BUTTON_SIZE = 27;
const ICON_SIZE = 25;

const OperationIcons = (props) => {
    return (
        <View style = {styles.iconWrapper}>
            {props.icon}
            <Text style = {styles.iconTextStyle}>{props.text}</Text>
        </View>
    )
}

const FileStats = (props) => {
    const {theme} = props; 
    return  (<Card.Content style = {styles.contentStyle}>
                <Paragraph style = {{color: theme.colors.primary, fontWeight: 'bold'}}>{props.title}</Paragraph>
                <Paragraph style = {{fontSize: 13}}>{props.info}</Paragraph>
            </Card.Content>)
}

const BottomSlider = (props) => {
    const {visible, hideModal, selectedPdf, theme, showDeleteModal, openRenameModal} = props;
    const {setFavPdfs, getFavPdfs} = usePdfContext();
    const [pdf, setPdf] = useState(null);
    
    const setFavourite = () => {
        setPdf(prev => ({...prev, isFav: !prev.isFav}))
        setTimeout(() => {
            Realm.open({
                path: "myrealm",
                schema: schema
            }).then(realm => {
                const oldPdf = realm.objectForPrimaryKey('Pdf', pdf._id);
                realm.write(() => {
                    oldPdf.isFav = !oldPdf.isFav
                })
                getFavPdfs(setFavPdfs);
            })
        }, 500)
        
    }

    const sharePdf = () => {
        hideModal();
        const options = {
            url: `file://${selectedPdf.path}`,
            title: 'Share this pdf',
            type: 'application/pdf',
        }
        Share.open(options)
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            err && console.log(err);
        });
    }

    useEffect(() => {
        Realm.open({
            path: "myrealm",
            schema: schema
        }).then(realm => {
            const curpdf = realm.objectForPrimaryKey('Pdf', selectedPdf._id);
            setPdf({
                _id: curpdf._id,
                name: curpdf.name,
                path: curpdf.path,
                dir: curpdf.dir,
                size: curpdf.size,
                displaySize: curpdf.displaySize,
                displayPath: curpdf.displayPath,
                creationDate: curpdf.creationDate,
                lastRead: curpdf.lastRead,
                isFav: curpdf.isFav,
            });
        })

    }, [])

    return (
        pdf === null ? <View></View> :
        <Modal 
            animationType = "slide"
            transparent={true}
            visible={visible}
            onRequestClose={() => {
                hideModal();
            }} 
        >
            <TouchableOpacity style = {styles.Underlay} activeOpacity = {1} onPress = {() => hideModal()}>
                <Animated.View style={[styles.Overlay]} onStartShouldSetResponder={() => true}>
                    <Card style = {styles.TopCard}>
                        <Card.Title 
                            title = {pdf.name} 
                            titleStyle = {{fontSize: 15}}
                            left = {() => <Icon name = "file-pdf" color = '#694fad' size = {35}></Icon>}
                        />
                    </Card>
                    <Divider/>
                    <View style = {styles.iconWrapperContainer}>
                        {/* Copy */}
                        <OperationIcons
                            icon = {
                                <IconButton 
                                size = {ICON_BUTTON_SIZE}
                                icon={() => <Icon name = "copy" color = {theme.colors.primary} size = {ICON_SIZE}/>}
                                onPress={() => {
                                    setTimeout(() => props.openBrowserModal(0), 500);
                                    hideModal();
                                }} 
                                />
                            }
                            text = {'Copy'}
                        />   

                        {/* Cut */}
                        <OperationIcons
                            icon = {
                                <IconButton 
                                size = {ICON_BUTTON_SIZE}
                                icon={() => <MaterialIcons name = "content-cut" color = {theme.colors.primary} size = {ICON_SIZE}/>}
                                onPress={() => {
                                    setTimeout(() => props.openBrowserModal(1), 500);
                                    hideModal();
                                }} 
                                />
                            }
                            text = {'Cut'}
                        /> 
                        
                        {/* Rename */}
                        <OperationIcons
                            icon = {
                                <IconButton 
                                size = {ICON_BUTTON_SIZE}
                                icon={() => <MaterialIcons name = "drive-file-rename-outline" color = {theme.colors.primary} size = {ICON_SIZE}/>}
                                onPress={() => openRenameModal()} 
                                />
                            }
                            text = {'Rename'}
                        />

                        {/* Delete */}
                        <OperationIcons
                            icon = {
                                <IconButton 
                                size = {ICON_BUTTON_SIZE}
                                icon={() => <MaterialIcons name = "delete" color = {theme.colors.primary} size = {ICON_SIZE}/>}
                                onPress={() => {showDeleteModal()}} 
                                />
                            }
                            text = {'Delete'}
                        />
                        
                        {/* Favourite */}
                        <OperationIcons
                            icon = {
                                <IconButton 
                                size = {ICON_BUTTON_SIZE}
                                icon={() => pdf.isFav ?
                                    <MaterialIcons name = "favorite" color = {theme.colors.primary} size = {ICON_SIZE}/> :
                                    <MaterialIcons name = "favorite-border" color = {theme.colors.primary} size = {ICON_SIZE}/>
                                }
                                onPress={() => {setFavourite()}} 
                                />
                            }
                            text = {'Favourite'}
                        />

                        {/* Share */}
                        <OperationIcons
                            icon = {
                                <IconButton 
                                size = {ICON_BUTTON_SIZE}
                                icon={() => <Icon name = "share" color = {theme.colors.primary} size = {ICON_SIZE}/>}
                                onPress={() => sharePdf()} 
                                />
                            }
                            text = {'Share'}
                        />

                    </View>
                    <Divider/>
                    <Card elevation = {0}>
                        <FileStats title = "Full Path" info = {pdf.path} theme = {theme}/>
                        <FileStats title = "Size" info = {pdf.displaySize} theme = {theme}/>
                        <FileStats title = "Last Modified" info = {pdf.creationDate} theme = {theme}/>
                        <FileStats title = "Last Opened" info = {pdf.lastRead === null ? 'Not opened yet!': pdf.lastRead.toString()} theme = {theme}/>
                    </Card>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
        
    );
}

const styles = StyleSheet.create({ 
    Underlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: '#00000080',
    },  
    Overlay: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: 550,
    },
    TopCard: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    contentStyle: {
        marginBottom: 12,
    },
    iconWrapperContainer: {
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        height: 150, 
        justifyContent: 'center',
    },
    iconWrapper: {
        justifyContent: 'center', 
        alignItems: 'center',
        width:95
    },
    iconTextStyle: {
        fontStyle: 'italic'
    }
});

export default withTheme(BottomSlider);