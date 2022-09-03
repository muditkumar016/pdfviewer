import React from 'react';
import {
  Text,
  View,
} from 'react-native';
import { Card, withTheme, IconButton, TouchableRipple} from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


const PdfItem = (props) => {
    const {item, showBottomSlider,theme, navigation } = props;
    const ViewPdf = (_id) => {
        navigation.navigate('Viewer', {'_id': _id});
    }

    const Subtitle = () => {
        return <Text style = {{flex:1}}>
            {item.displayPath}<Dot/>
            {item.displaySize}<Dot/>{item.creationDate}
        </Text>
    };

    const Dot = () => {
        return <Entypo name = "dot-single" color = '#694fad' size = {15} />;
    }
    
    return  (<TouchableRipple rippleColor="rgba(0, 0, 0, .32)"  onPress = {() => ViewPdf(item._id)}>
                <View style = {{borderBottomWidth: 0.5}}>
                    <Card.Title 
                        title = {item.name} 
                        subtitle = {<Subtitle/>} 
                        titleStyle = {{fontSize: 15}}
                        left = {() => <Icon name = "file-pdf" color = '#694fad' size = {35}></Icon>}
                        right={() => 
                            <IconButton
                                icon={() => <MaterialIcons name = "more-vert" color = '#694fad' size = {25}></MaterialIcons>}
                                onPress={() => showBottomSlider(item)} />
                            }
                    />
                </View>
            </TouchableRipple>);
}

export default withTheme(PdfItem);