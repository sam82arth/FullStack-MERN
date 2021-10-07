import React, { useState, useEffect } from 'react'
import { LinkContainer } from 'react-router-bootstrap'
import { Table, Button, Row, Col } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import Paginate from '../components/Paginate'
import FormContainer from '../components/FormContainer'
import { Form } from 'react-bootstrap'
import XLSX from 'xlsx' 
import {
  listProducts,
  deleteProduct,
  createProduct,
  bulkProducts,

} from '../actions/productActions'
import { PRODUCT_CREATE_RESET } from '../constants/productConstants'

const ProductListScreen = ({ history, match }) => {
  const pageNumber = match.params.pageNumber || 1
  const [file, setFile] = useState()
  const dispatch = useDispatch()

  const productList = useSelector((state) => state.productList)
  const { loading, error, products, page, pages } = productList

  const productDelete = useSelector((state) => state.productDelete)
  const {
    loading: loadingDelete,
    error: errorDelete,
    success: successDelete,
  } = productDelete

  const productCreate = useSelector((state) => state.productCreate)
  const {
    loading: loadingCreate,
    error: errorCreate,
    success: successCreate,
    product: createdProduct,
  } = productCreate

  
  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  useEffect(() => {
    dispatch({ type: PRODUCT_CREATE_RESET })

    if (!userInfo || !userInfo.isAdmin) {
      history.push('/login')
    }

    if (successCreate) {
      history.push(`/admin/product/${createdProduct._id}/edit`)
    } else {
      dispatch(listProducts('', pageNumber))
    }
  }, [
    dispatch,
    history,
    userInfo,
    successDelete,
    successCreate,
    createdProduct,
    pageNumber,
  ])

  const deleteHandler = (id) => {
    if (window.confirm('Are you sure')) {
      dispatch(deleteProduct(id))
    }
  }

  const createProductHandler = () => {
  
    dispatch((createProduct()))
  }
  function processExcel(data) {
    const workbook = XLSX.read(data, {type: 'binary'});
    const firstSheet = workbook.SheetNames[0];
    const excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);

    setFile(excelRows);
}
function Upload() {
  const fileUpload = (document.getElementById('fileUpload'));

  const regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
  if (regex.test(fileUpload.value.toLowerCase())) {
      let fileName = fileUpload.files[0].name;
      if (typeof (FileReader) !== 'undefined') {
          const reader = new FileReader();
          if (reader.readAsBinaryString) {
              reader.onload = (e) => {
                  processExcel(reader.result);
              };
              reader.readAsBinaryString(fileUpload.files[0]);
          }
      } else {
          console.log("This browser does not support HTML5.");
      }
  } else {
    fileUpload.value = null;
      window.alert("Please upload a valid Excel file.");
  }
}
  const bulkDataHandler = (e) => {
    e.preventDefault()
   
if(!file)
{
  window.alert("please upload excel file")
}
    dispatch(
      bulkProducts({
        data : file
      })
    )
  }

  return (
    <>
      <Row className='align-items-center'>
        <Col>
          <h1>Items</h1>
        </Col>

        <FormContainer>
        <Form onSubmit={bulkDataHandler}>
        <Form.Group controlId='name'>
                 
                  <Form.Control
                   id="fileUpload"
                    type='file'
                    placeholder='Enter name'
                    onChange={(e) => Upload()}
                  ></Form.Control>
                </Form.Group>
        <Col className='text-left'>
        <Button type='submit'   >
        <i className='fas fa-plus'></i> Bulk Data
            </Button>
        </Col>
       
        </Form>
        </FormContainer>


        <Col className='text-right'>
          <Button className='my-3' onClick={createProductHandler}>
            <i className='fas fa-plus'></i> Add Item
          </Button>
        </Col>
      </Row>
      {loadingDelete && <Loader />}
      {errorDelete && <Message variant='danger'>{errorDelete}  </Message>}
      {loadingCreate && <Loader />}
      {errorCreate && <Message variant='success'>{errorCreate}  </Message>}
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}  </Message>
      ) : (
        <>
          <Table striped bordered hover responsive className='table-sm'>
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>PRICE</th>
                <th>CATEGORY</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product.item_id}</td>
                  <td>{product.name}</td>
                  <td>₹{product.price}</td>
                  <td>{product.category}</td>

                  <td>
                    <LinkContainer to={`/admin/product/${product._id}/edit`}>
                      <Button variant='light' className='btn-sm'>
                        <i className='fas fa-edit'></i>
                      </Button>
                    </LinkContainer>
                    <Button
                      variant='danger'
                      className='btn-sm'
                      onClick={() => deleteHandler(product._id)}
                    >
                      <i className='fas fa-trash'></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Paginate pages={pages} page={page} isAdmin={true} />
        </>
      )}
    </>
  )
}

export default ProductListScreen
