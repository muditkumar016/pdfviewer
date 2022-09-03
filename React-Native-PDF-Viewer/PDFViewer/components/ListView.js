import React from "react";
import { View, Dimensions } from "react-native";
import { RecyclerListView, LayoutProvider } from "recyclerlistview";
import PdfItem from "./PdfItem";

const ViewTypes = {
    FULL: 0,
    HALF_LEFT: 1,
    HALF_RIGHT: 2
};

export default class ListView extends React.PureComponent {
    constructor(args) {
        super(args);
        let { width } = Dimensions.get("window");
        this._layoutProvider = new LayoutProvider(
            index => {
                return ViewTypes.FULL;
            },
            (type, dim) => {
                dim.width = width;
                dim.height = 73;
            }
        );
        
        this._rowRenderer = this._rowRenderer.bind(this);
    }


    //Given type and data return the view component
    _rowRenderer(type, data) {
        //You can return any view here, CellContainer has no special significance
        return <PdfItem item = {data} theme = {this.props.theme} showBottomSlider = {this.props.showBottomSlider} navigation = {this.props.navigation}/>
    }

    
    render() {
        return (
            <View style = {{flex: 1}}>
                <RecyclerListView layoutProvider={this._layoutProvider} dataProvider={this.props.data} rowRenderer={this._rowRenderer} />       
            </View>
            
        );
    }
}

