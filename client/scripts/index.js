import React from 'react';
import { render } from 'react-dom';
import $ from 'jquery';
import getHours from './services/getHours';
// import getMovies from './services/getMovies';

/*
 * Search Input
 */
class SearchInput extends React.Component {

    constructor( props ) {
        super( props );

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange( event ) {
        this.props.updateCurrentSearch( event.target.value );
    }

    handleSubmit( event ) {
        // TODO: sanitize text input
        event.preventDefault();
        this.props.productSearch();
    }

    render() {
        return (<div className="search-input">
            <form onSubmit={ this.handleSubmit }>
                <label htmlFor="searchQuery">Search:
                    <input type="text" id="searchQuery" value={ this.props.currentSearch } onChange={ this.handleChange } />
                </label>
                <input type="submit" />
            </form>
        </div>)
    }
}

/*
 * Search Item
 */
class SearchItem extends React.Component {
    constructor( props ) {
        super( props );

        this.updateProduct = this.updateProduct.bind( this );
    }

    updateProduct( product ) {
        this.props.updateProduct( product );
    }

    render() {
        if ( this.props.product.name && this.props.product.price_in_cents ) {
            return (<div className="search-item"
                onClick={ () => { this.updateProduct(this.props.product) } }>
                <img src={ this.props.product.image_thumb_url } />
                <p>{ this.props.product.name }</p>
                <p>${ ( this.props.product.price_in_cents * 0.01 ).toFixed( 2 ) }</p>
                <p>Quantity: { this.props.product.quantity }</p>
                </div>)
        } else {
            return null;
        }
    }
}

/*
 * Search List
 */
class SearchList extends React.Component {

    constructor( props ) {
        super( props );

        this.updateProduct = this.updateProduct.bind( this );
    }

    updateProduct( product ) {
        this.props.updateCurrentProduct( product );
    }

    render() {
        if ( this.props.products.length > 0 ) {
            return (
                <div className="search-list">
                    { this.props.products.map( ( product, index ) => <SearchItem key={ index } product={ product } updateProduct={ this.updateProduct } />) }
                </div>
            )
        } else {
            return (
                <div><h1>No products found.</h1></div>
            )
        }
    }
}

/*
 * Store List
 * Lists closest stores to user location
 */
class StoreList extends React.Component {
    constructor( props ) {
        super( props );

        this.handleChange = this.handleChange.bind( this );
    }

    handleChange( event ) {
        console.log( 'store id changed to: ', event.target.value );
        this.props.updateCurrentStoreId( event.target.value );
    }

    render() {
        if ( this.props.stores ) {
            return (
                <div className="store-list">
                    <p>Change Store:</p>
                    <select onChange={ this.handleChange }>
                        { this.props.stores.map( ( store, index ) =>
                            <option key={ index } value={ store.id }>{ store.name }</option>
                        ) }
                    </select>
                </div>
            )
        }
    }
}

/*
 * Updated At Panel
 * Shows when search result data was last updated
 */
const UpdatedAtPanel = ( props ) => {
    if ( props.date ) {
        return (
            <div className="updated-at-panel">
                <p>Updated at { props.date }</p>
            </div>
        )
    } else {
        return (
            <div className="updated-at-panel"></div>
        )
    }
}

/*
 * Product Info Panel
 */
class ProductInfo extends React.Component {
    constructor( props ) {
        super( props );

        this.saveProduct = this.saveProduct.bind(this);
    }

    saveProduct() {
        const savedProduct = {
            id: this.props.product.id,
            name: this.props.product.name,
            image_thumb_url: this.props.product.image_thumb_url,
        }

        const savedProductObject = Object.assign( {}, savedProduct );

        fetch('/api/savedproducts', {
            method: 'POST',
            body: JSON.stringify(savedProduct),
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }

    render() {
        if ( this.props.product ) {
            return (
                <div className="product-info">
                    <div className="product-info__img">
                        <img src={ this.props.product.image_url } />
                        <a onClick={ this.saveProduct }>Save</a>
                    </div>
                    <div className="product-info__txt">
                        <h2>{ this.props.product.name }</h2>
                        <p><strong>Quantity: { this.props.product.quantity }</strong></p>
                        <p>{ this.props.product.origin }</p>
                        <p>${ ( this.props.product.price_in_cents * 0.01 ).toFixed( 2 ) }</p>
                        <p>{ this.props.product.serving_suggestion }</p>
                        <p>{ this.props.product.tasting_note }</p>
                    </div>
                </div>
            )
        } else {
            return (<div className="product-info"><p>Empty</p></div>);
        }
     }
}

/*
 * Main App
 */
class App extends React.Component {

    constructor( props ) {
        super( props );

        this.state = {
            currentSearch: 'organic wine',
            currentSearchDataAge: '',
            currentProduct: '',
            currentStoreId: '',
            products: [],
            stores: [],
        };

        this.productSearch = this.productSearch.bind( this );
        this.storeSearch = this.storeSearch.bind( this );
        this.updateCurrentProduct = this.updateCurrentProduct.bind( this );
        this.updateCurrentStoreId = this.updateCurrentStoreId.bind( this );
        this.updateCurrentSearch = this.updateCurrentSearch.bind( this );
    }

    storeSearch() {
        const reactThis = this;

        console.log( 'Finding your location...' );

        if ( navigator.geolocation ) {

            navigator.geolocation.getCurrentPosition( function( data ) {

                console.log( 'Location found.' );

                let user_lat = data.coords.latitude;
                let user_lon = data.coords.longitude;

                $.ajax({
                    url: 'http://lcboapi.com/stores',
                    data: {
                        lat: user_lat,
                        lon: user_lon,
                        per_page: 10,
                    },
                    dataType: 'jsonp',
                    error: function( error ){
                        console.log( 'geolocation error', error );
                    }
                }).then( function( data ) {

                    console.log( data );

                    reactThis.setState( {
                        stores: data.result,
                        currentStoreId: data.result[0].id,
                     } );

                    // Pass id of closest store to productSearch function
                    reactThis.productSearch();

                });

            } );
        } else {
            alert( 'Geolocation not working.' );
        }
    }

    productSearch() {
        const reactThis = this;

        console.log( 'Finding products...' );

        console.log( 'productSearch with store id ', reactThis.state.currentStoreId );

        $.ajax({
            url: 'http://lcboapi.com/products',
            data: {
                store_id: reactThis.state.currentStoreId,
                q: this.state.currentSearch,
                is_dead: false,
            },
            dataType: 'jsonp',
            error: function( error ) {
                console.log( 'error', error );
            }
        }).then( function( data ) {
            console.log( 'productSearch result = ', data );

            reactThis.setState( { currentSearchDataAge: data.store.updated_at } );

            var productsInStock = data.result.filter( function( product ) {
                return product.quantity > 0;
            } );
            reactThis.setState( { products: productsInStock } );
        });
    }

    componentDidMount() {
        this.storeSearch();
    }

    updateCurrentSearch( string ) {
        this.setState( { currentSearch: string } );
    }

    updateCurrentProduct( data ) {
        this.setState( { currentProduct: data } );
    }

    updateCurrentStoreId( store_id ) {
        var reactThis = this;

        this.setState( { currentStoreId: store_id } );
        setTimeout( function() {
            reactThis.productSearch();
        }, 0 );
    }

    render() {
        return (
            <div className="search-wrapper">
                <ProductInfo product={ this.state.currentProduct } />
                <div className="search">
                        <SearchInput currentSearch={ this.state.currentSearch } updateCurrentSearch={ this.updateCurrentSearch } productSearch={ this.productSearch } />
                        <StoreList stores={ this.state.stores } productSearch={ this.productSearch } updateCurrentStoreId={ this.updateCurrentStoreId } />
                        <UpdatedAtPanel date={ this.state.currentSearchDataAge } />
                    <SearchList products={ this.state.products } updateCurrentProduct={ this.updateCurrentProduct } />
                </div>
            </div>
        )
    }
}

render(<App />, document.getElementById('app'));
