import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, NavLink, Switch, Route } from 'react-router-dom';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';


class Home extends React.Component {
    render(){
        return(
            <p>Welcome to Acme! Make a selection from the nav above to view our products, or make a new one! 🤷</p>
        )
    }
}

class Nav extends React.Component {
    render(){
        return(
            <nav>
                <NavLink to='/'>Home</NavLink>
                <NavLink to='/products'>Products</NavLink>
                <NavLink to='/create'>Create</NavLink>
            </nav>
        )
    }
}

class Products extends React.Component {
    render(){
        const {destroy, products} = this.props;
        return(
            <>
                <h2>Products</h2>
                <ul>
                {products.map((product) => {
                    return (
                        <li>
                            <NavLink to={`/update/${product.id}`}>{product.name}</NavLink>
                            <button onClick={()=> destroy(product.id)}>Delete</button>
                        </li>
                    ) 
                })}
                </ul>
            </>
        )
    }
}

class Create extends React.Component {
    state = {
        inputValue: ''
    }

    updateInput(value){
        this.setState({inputValue: value});
    }

    render(){
        const {inputValue} = this.state;
        const {post} = this.props; //destructure post method from App component
        return( // called post method inside the button onClick
            <>
                <h2>Create A Product</h2>
                <div className='form'>
                    <input type='text' value={inputValue} onChange={(event)=>this.updateInput(event.target.value)}/>
                    <button onClick={() => post(inputValue)}>Create</button> 
                </div>
            </>
        )
    }
}

class Update extends React.Component {
    state = {
        inputValue: '',
        hash: window.location.hash.slice(9)
    }

    async componentDidMount(){
        const {products} = this.props;
        const {hash} = this.state;
        const findProduct = products.find(product => product.id === hash);
        await this.setState({inputValue: findProduct.name})
    }

    render(){
        const {inputValue, hash} = this.state;
        const {update} = this.props;

        return(
            <>
                <h2>Update this product</h2>
                <div className='form'>
                    <input type='text' value={inputValue} onChange={(event) => this.setState({inputValue: event.target.value}, console.log(this.state))}/>
                    <button onClick={() => update(hash, this.state.inputValue)}>Update</button> 
                </div>
            </>
        )
    }
}

class App extends React.Component {
    state = {
        products: []
    }

    componentDidMount(){ //fetch data to put into productsstate
        axios.get('http://localhost:3000/api/products')
        .then(res => this.setState({products: res.data}))
        .catch(error => console.log(error))
    }

    post(name){ //post method to be passed into Create component as props
        return axios.post(`http://localhost:3000/api/products/${uuidv4()}`, {id: uuidv4(), name: name })
        .then(res => this.setState({products: [res.data, ...this.state.products]}))
        .catch(error => console.log(error));
    }

    destroy(id){
        return axios.delete(`http://localhost:3000/api/products/${id}`)
        .then(res => this.setState({products: this.state.products.filter(product => product.id !== res.data.id)}))
        .catch(error => console.log(error));
    }

    update(id, value){
        return axios.put(`http://localhost:3000/api/products/${id}`, {name: value})
        .then(response => this.setState({products}))
        .catch(error => console.log(error));
    }

    render(){
        const {products} = this.state;       
        return( //must pass an argument such as 'input' below, so that the post method is scoped to parent when called by the child component
            <HashRouter>
                <div>
                    <h1>Acme Products</h1>
                    <Nav/>
                    <Switch>
                        {/* <Route path='/' component={() => <Home/>}/> */}
                        <Route path='/create' component={() => <Create post={(name) => this.post(name)}/>}/>
                        <Route path='/products' component={() => <Products products={products} destroy={(id) => this.destroy(id)}/> }/>
                        <Route path='/update/:id' component={() => <Update products={products} update={(id, name) => this.update(id, name)}/>}/>
                    </Switch>
                </div>
            </HashRouter>
        )
    }
}

ReactDOM.render(<App/>, document.querySelector('#app'))