# React Native Places Input
Up to date working Google Places Input. Calling directly API not JS SDK.

![exmaples](https://s5.gifyu.com/images/places.gif)

## Installation

    yarn add react-native-places-input
    
or

    npm intsall react-native-places-input
    
## Usage
Fairly easy. Few required props but most of the work is already done in a component.

### Basic

```javascript
import PlacesInput from 'react-native-places-input';
```

And inside a component

```javascript
    <PlacesInput
        googleApiKey={GOOGLE_API_KEY}
        onSelect={place => console.log(place}
    />
```

```javascript
class InputWrapper extends React.Component {
    render() {
        return (
            <View style={{ width: '100%' }}>
                <PlacesInput
                    googleApiKey={GOOGLE_API_KEY}
                    placeHolder={"Some Place holder"}
                    language={"en-US"}
                    onSelect={place => {
                        this.props.goToPoint(get(place, 'result.geometry.location.lat'), get(place, 'result.geometry.location.lng'))
                    }}
                    iconResult={<Ionicons name="md-pin" size={25} style={styles.placeIcon}/>}
                />
            </View>
        );
    }
}
```

### Configuration props
List of props supported by a component

Prop       | Type    | Default    | Description
---------- | ------- | ---------- | -----------------------
googleApiKey | PropTypes.string.isRequired, | | Google API key
iconInput | PropTypes.any, | | Icon added to an input
iconResult | PropTypes.any, | | Icon added to results
language | PropTypes.string, | en | Language for google API call
placeHolder | PropTypes.string, | Search places... | placeholder for an input
queryFields | PropTypes.string, | formatted_address,geometry,name | Fields requested from Google API
resultRender | PropTypes.func, | place => place.description | Function to render results text
searchLatitude | PropTypes.number, | 51.905070 | Lat to limit results
searchLongitude | PropTypes.number, | 19.458834 | Lng to limit results
searchRadius | PropTypes.number, | 1000 | radius to limit results
stylesContainer | PropTypes.object, | {} | Custom styles for a container
stylesInput | PropTypes.object,| {} | Custom styles for an input
stylesItem | PropTypes.object,| {} | Custom styles for an item
stylesItemText | PropTypes.object,| {} | Custom styles for an item text
stylesList | PropTypes.object,| {} | Custom styles for a list
stylesLoading | PropTypes.object,| {} | Custom styles for a loading indicator
textInputProps | PropTypes.object, | {} | Custom TextInput props
onSelect | PropTypes.func, | | Function called when you select a place
