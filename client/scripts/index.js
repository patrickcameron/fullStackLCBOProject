import React from 'react';
import { render } from 'react-dom';
import $ from 'jquery';
import axios from 'axios';

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
        this.props.apiSearch();
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
                onClick={ () => {this.updateProduct(this.props.product)} }>
                <img src={ this.props.product.image_thumb_url } />
                <p>{ this.props.product.name }</p>
                <p>${ ( this.props.product.price_in_cents * 0.01 ).toFixed( 2 ) }</p>
                <p>{ this.props.product.quantity }</p>
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
        return (
            <div className="search-list">
            { this.props.products.map( ( product, index ) => <SearchItem key={ index } product={ product } updateProduct={ this.updateProduct } />) }
            </div>
        )
    }
}

/*
 * Product Info Panel
 */
class ProductInfo extends React.Component {
    constructor( props ) {
        super( props );
    }

    render() {
        if ( this.props.product ) {
            return (
                <div className="product-info">
                    <img src={ this.props.product.image_url } />
                    <p>{ this.props.product.name }</p>
                    <p>${ ( this.props.product.price_in_cents * 0.01 ).toFixed( 2 ) }</p>
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
            currentSearch: 'red wine',
            currentProduct: '',
            products: [],
        };

        this.apiSearch = this.apiSearch.bind( this );
        this.updateCurrentSearch = this.updateCurrentSearch.bind( this );
        this.updateCurrentProduct = this.updateCurrentProduct.bind( this );
    }

    apiSearch() {
        const reactThis = this;

        $.ajax({
            url: 'http://lcboapi.com/products?store_id=528&q=' + this.state.currentSearch,
            dataType: 'jsonp',
            error: function( error ) {
                console.log( 'error', error );
            }
        }).then( function( data ) {
            console.log( data.result );
            var productsInStock = data.result.filter( function( product ) {
                return product.quantity > 0;
            } );
            console.log( productsInStock );
            reactThis.setState( { products: productsInStock } );
        });
    }

    componentDidMount() {
        this.apiSearch();
    }

    updateCurrentSearch( string ) {
        this.setState( { currentSearch: string } );
    }

    updateCurrentProduct( data ) {
        this.setState( { currentProduct: data } );
    }

    render() {
        return (
            <div className="search-wrapper">
                <SearchInput currentSearch={ this.state.currentSearch } updateCurrentSearch={ this.updateCurrentSearch } apiSearch={ this.apiSearch } />
                <ProductInfo product={ this.state.currentProduct } />
                <SearchList products={ this.state.products } updateCurrentProduct={ this.updateCurrentProduct } />
            </div>
        )
    }
}

render(<App />, document.getElementById('app'));
