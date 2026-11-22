import { useEffect, useState } from 'react'
import './ListProduct.css'
import cross_icon from '../../assets/cross_icon.png'
import { adminFetch } from '../../api'

const ListProduct = () => {

    const [allproducts,setAllProducts] = useState([]);
    const [error,setError] = useState('');

    const requestProducts = () => adminFetch('/allproducts').then((response) => {
      if (!response.ok) {
        throw new Error('Products could not be loaded.')
      }
      return response.json()
    })

    const fetchInfo = async () => {
      try {
        setAllProducts(await requestProducts())
        setError('')
      } catch {
        setError('Products could not be loaded. Please try again.')
      }
    }

    useEffect(()=>{
      let active = true
      requestProducts()
        .then((products) => {
          if (active) {
            setAllProducts(products)
            setError('')
          }
        })
        .catch(() => {
          if (active) {
            setError('Products could not be loaded. Please try again.')
          }
        })
      return () => { active = false }
    },[])

    const remove_product = async (id)=>{
      try {
        const response = await adminFetch('/removeproduct',{
          method:'POST',
          headers:{
            Accept:'application/json',
            'Content-Type':'application/json',
          },
          body:JSON.stringify({id:id})
        })
        if (!response.ok) {
          throw new Error('Product could not be removed.')
        }
        await fetchInfo()
      } catch {
        setError('Product could not be removed. Please try again.')
      }
    }

  return (
    <div className='list-product'>
        <h1>All Products List</h1>
        {error && <p role="alert">{error}</p>}
        <div className="listproduct-format-main">
          <p>Product</p>
          <p>Title</p>
          <p>Old Price</p>
          <p>New Price</p>
          <p>Category</p>
          <p>Remove</p>
        </div>
        <div className="listproduct-allproducts">
          <hr />
          {allproducts.map((product,index)=>{
              return <>
              <div key={index} className="listproduct-format-main listproduct-format">
                  <img src={product.image} alt="" className="listproduct-product-icon" />
                  <p>{product.name}</p>
                  <p>${product.old_price}</p>
                  <p>${product.new_price}</p>
                  <p>{product.category}</p>
                  <img onClick={()=>{remove_product(product.id)}} className='listproduct-remove-icon' src={cross_icon} alt="" />
              </div>
              <hr />
              </>
          })}
        </div>
    </div>
  )
}

export default ListProduct