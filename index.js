import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';

class PlacesInput extends Component {
  state = {
    query: this.props.query || '',
    places: [],
    showList: false,
    isLoading: false,
  };

  timeout = null;

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.query !== this.props.query) {
      this.setState({
        query: this.props.query
      }, () => {
        this.fetchPlaces()
      })
    }
  }


  componentDidMount() {
    if (this.props.query) {
      this.fetchPlaces()
    }
  }


  render() {
    return (
      <View style={{flex:1}}>
        <View style={ styles.contentBG }>
            <TouchableOpacity style={ styles.leftView } onPress={ this.props.backSelection }>
              <Image style={ styles.leftImage } source={ require('./arrow_back.png') } />
            </TouchableOpacity>
      <View style={[styles.textInputBG, this.props.stylesContainer]}>      
        <TextInput
          placeholder={this.props.placeHolder}
          style={[styles.input, styles.textInput, this.props.stylesInput]}
          onChangeText={query => {
            this.setState({query}, () => {
              this.onPlaceSearch();
              this.props.onChangeText && this.props.onChangeText(query, this);
            });
          }}
          value={this.state.query}
          onFocus={() => this.setState({showList: true})}
          onBlur={() => this.setState({showList: false})}
          {...this.props.textInputProps}
          clearButtonMode="always"
        />
        </View>
        </View>
        {this.state.showList && (
          <View
            style={[styles.scrollView, this.props.stylesList]}
            keyboardShouldPersistTaps="always"
          >
            {this.props.contentScrollViewTop}
            {this.state.isLoading && (
              <ActivityIndicator
                size="small"
                style={[styles.loading, this.props.stylesLoading]}
              />
            )}
            {this.state.places.map(place => {
              console.log(place);
              return (
                <TouchableOpacity
                  key={`place-${place.place_id || place.id}`}
                  style={[styles.place, this.props.stylesItem]}
                  onPress={() => this.onPlaceSelect(place.place_id, place)}
                >
                  <View style={styles.itemBG}>
                  <Image style={ styles.time } source={ require('./time.png') } />
                  <View style={styles.itemContent}>
                  <Text style={[styles.placeText, this.props.stylesItemText]}
                  numberOfLines={1}>
                    {place.terms[0].value}
                  </Text>
                  <Text style={[styles.placeText, styles.subTitle, this.props.stylesItemText]}
                  numberOfLines={3}>
                    {this.props.resultRender(place)}
                  </Text>
                  {this.props.iconResult}
                  </View>
                  </View>
                </TouchableOpacity>
              );
            })}
            {this.props.contentScrollViewBottom}
          </View>
        )}
      </View>
    );
  }

  onPlaceSearch = () => {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.fetchPlaces, this.props.requiredTimeBeforeSearch);
  };

  buildCountryQuery = () => {
    const {queryCountries} = this.props;

    if (!queryCountries) {
      return '';
    }

    return `&components=${queryCountries.map(countryCode => {
      return `country:${countryCode}`;
    }).join('|')}`;
  };

  buildLocationQuery = () => {
    const {searchLatitude, searchLongitude, searchRadius} = this.props;

    if (!searchLatitude || !searchLongitude || !searchRadius) {
      return '';
    }

    return `&location=${searchLatitude},${searchLongitude}&radius=${searchRadius}`;
  };

  buildTypesQuery = () => {
    const {queryTypes} = this.props;

    if (!queryTypes) {
      return '';
    }

    return `&types=${queryTypes}`;
  };

  buildSessionQuery = () => {
    const {querySession} = this.props;

    if (querySession) {
      return `&sessiontoken=${querySession}`
    }

    return ''
  };

  fetchPlaces = async () => {
    if (
      !this.state.query ||
      this.state.query.length < this.props.requiredCharactersBeforeSearch
    ) {
      return;
    }
    this.setState(
      {
        showList: true,
        isLoading: true,
      },
      async () => {
        const places = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${
            this.state.query
          }&key=${this.props.googleApiKey}&inputtype=textquery&language=${
            this.props.language
          }&fields=${
            this.props.queryFields
          }${this.buildLocationQuery()}${this.buildCountryQuery()}${this.buildTypesQuery()}${this.buildSessionQuery()}`
        ).then(response => response.json());

        this.setState({
          isLoading: false,
          places: places.predictions,
        });
      }
    );
  };

  onPlaceSelect = async (id, passedPlace) => {
    const {clearQueryOnSelect} = this.props;

    this.setState({
      isLoading: true,
    }, async () => {
      try {
        const place = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?placeid=${id}&key=${this.props.googleApiKey}&fields=${this.props.queryFields}&language=${this.props.language}${this.buildSessionQuery()}`
        ).then(response => response.json());

        return this.setState(
          {
            showList: false,
            isLoading: false,
            query: clearQueryOnSelect ? '' :
              place &&
              place.result &&
              (place.result.formatted_address || place.result.name),
          },
          () => {
            return this.props.onSelect && this.props.onSelect(place);
          }
        );
      } catch (e) {
        return this.setState(
          {
            isLoading: false,
            showList: false,
            query: passedPlace.description,
          },
          () => {
            return this.props.onSelect && this.props.onSelect(passedPlace);
          }
        );
      }
    });
  };
}

PlacesInput.propTypes = {
  clearQueryOnSelect: PropTypes.bool,
  contentScrollViewBottom: PropTypes.node,
  contentScrollViewTop: PropTypes.node,
  stylesInput: PropTypes.object,
  stylesContainer: PropTypes.object,
  stylesList: PropTypes.object,
  stylesItem: PropTypes.object,
  stylesItemText: PropTypes.object,
  stylesLoading: PropTypes.object,
  resultRender: PropTypes.func,
  query: PropTypes.string,
  queryFields: PropTypes.string,
  queryCountries: PropTypes.array,
  queryTypes: PropTypes.string,
  querySession: PropTypes.string,
  searchRadius: PropTypes.number,
  searchLatitude: PropTypes.number,
  searchLongitude: PropTypes.number,
  googleApiKey: PropTypes.string.isRequired,
  placeHolder: PropTypes.string,
  textInputProps: PropTypes.object,
  iconResult: PropTypes.any,
  iconInput: PropTypes.any,
  language: PropTypes.string,
  onSelect: PropTypes.func,
  backSelection: PropTypes.func,
  onChangeText: PropTypes.func,
  requiredCharactersBeforeSearch: PropTypes.number,
  requiredTimeBeforeSearch: PropTypes.number,
};

PlacesInput.defaultProps = {
  stylesInput: {},
  stylesContainer: {},
  stylesList: {},
  stylesItem: {},
  stylesLoading: {},
  stylesItemText: {},
  queryFields: 'formatted_address,geometry,name',
  placeHolder: 'Search places...',
  textInputProps: {},
  language: 'en',
  resultRender: place => place.description,
  requiredCharactersBeforeSearch: 2,
  requiredTimeBeforeSearch: 1000,
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1000,
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D9D8D8',
  },
  scrollView: {
    backgroundColor: '#fff',
    flex: 1,
    marginTop: 30,
    left: 0,
    right: 0,
  },
  place: {
    height: 80,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 8,
    position: 'relative',
    zIndex: 10001,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeIcon: {
    position: 'absolute',
    top: 10,
    right: 15,
    color: 'rgba(0,0,0,0.3)',
  },
  placeText: {
    color: 'rgba(0,0,0,0.8)',
    paddingRight: 60,
    fontSize: 13,
    // lineHeight: 17,
  },
  loading: {
    margin: 10,
  },
  item: {
    // height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // itemBG: {
  //   flexDirection: 'row',
  // },
  itemContent: {
    marginLeft: 10,
    marginRight: 20,
   
    height: 60,
    flex: 1,
  },
  time: {
    width: 30,
    height: 30,
  },
  itemBG: {
    marginVertical:10,
    flexDirection: 'row',
  },
  subTitle: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 5,
    color: '#9B9B9B',
  },
  contentBG: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
  },
  leftImage: {
    width: 30,
    height: 29,
  },
  leftView: {
    width: 45,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  textInputBG: {
    flex: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D9D8D8',
    height: 50,
    marginRight: 15,
  },
  textInput: {
    height: '100%',
    paddingLeft: 19,
    color: '#4A4A4A',
    fontSize: 13,
    lineHeight: 16,
  },
  lineView: {
    backgroundColor: '#C2CACF',
    height: 0.5,
  },
});

export default PlacesInput;
