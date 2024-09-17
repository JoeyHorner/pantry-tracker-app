'use client'

import {Box,Stack, Typography, Button, Modal, TextField, Card, CardContent,  Dialog, DialogTitle, DialogContent, DialogActions} from "@mui/material"
import {firestore} from './firebase'
import {collection, query, doc, getDocs, getDoc, setDoc, deleteDoc} from 'firebase/firestore'
//source referenced for useEffect not defined error: https://github.com/TanStack/query/issues/1787, post by user mbaumbach
import {useEffect,useState, useRef, createRef} from 'react'
import { fetchRecipeSuggestions } from '@/apiClient';
import backgroundImage from './pantryBackground.jpg';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3

};
export default function Home() {
  const [pantry, setPantry] = useState([])
  const [open, setOpen] = useState(false)
  const [openSearch,setOpenSearch] = useState(false)
  const [openRecipe, setOpenRecipe] = useState(false)
  const [recipe, setRecipe] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const handleCloseDialog = () => setOpenDialog(false)
  const handleOpenDialog = () => setOpenDialog(true)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const handleOpenSearch = () => setOpenSearch(true)
  const handleCloseSearch = () => setOpenSearch(false)
  const handleOpenRecipe = () => setOpenRecipe(true)
  const handleCloseRecipe = () => setOpenRecipe(false)
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedItem, setHighlightedItem] = useState(null);
  const [itemRefs, setItemRefs] = useState({});
  const [itemName, setItemName] = useState('')
  const [items, setItems] = useState([]);
  const [data, setData] = useState(null);
  const [responseData, setResponseData] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [content, setContent] = useState('');
    
  const updatePantry = async (item) => {
      try{
      const snapshot = await getDocs(collection(firestore, 'pantry'), item)
      const pantryList = []
      const refs = {};
      snapshot.forEach((doc) => {
        if(doc.id){
        refs[doc.id] = createRef()
        pantryList.push({name: doc.id,
          ...doc.data(),
      
        })
      }
      
      })
      
      console.log(pantryList)
      await setItemRefs(refs)
      await setPantry(pantryList)
    }
      catch (error) {
        console.error("Error fetching pantry items: ", error);
      }
    }
  useEffect(() => {
    
    updatePantry()
  },[])

  //to get AI recipe suggestions
  const handleFetchSuggestions = async (cuisineType) => {
    const data = await fetchRecipeSuggestions(cuisineType);
    // Update the state with the response data
    setResponseData(extractContent(data));
     
};

  //add an item to the pantry

  const addItem = async (item) => {
    try{
    item = item.charAt(0).toUpperCase() + item.slice(1).toLowerCase();
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      const count = data.count || 0
      console.log(`Existing item count: ${count}`)
      await setDoc(docRef, {count: count + 1})
      await updatePantry()
      return
    }
    else{
    await setDoc(docRef, {count: 1})
    await updatePantry();
    }
  }
  catch(error)
  {
    console.error("Error adding item:", error)
  }
  };
  //remove an item from the pantry
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists())
    {
      const {count} = docSnap.data()
      if(count==1)
      {
        await deleteDoc(docRef)
      }
      else{
        await setDoc(docRef, {count: count - 1})
      }

    }
    
    await updatePantry()
  }
  //format response from AI
    const extractContent = (response) => {
    const strResponse = JSON.stringify(response)
    const match = strResponse.match(/"content":\s*"([^"]*)"/);
    return match ? match[1].replace(/\\n/g, '<br>') : 'No content found, please wait as content may still be loading';
  };
  
  //highlight an item in the pantry- used when searching for an item
  const highlightItem = (itemName) => {
    
    const itemElement = itemRefs[itemName]?.current;
    if (itemElement) {
      itemElement.scrollIntoView({ behavior: 'smooth' });
      itemElement.style.backgroundColor = 'DeepSkyBlue';
      setHighlightedItem(itemName);
      setTimeout(() => {
        itemElement.style.backgroundColor = '#f0f0f0';
        setHighlightedItem(null);
      }, 3000);
    
    } else {
      console.log(`Item ${itemName} not found`);
    }
  };

  //search for an item in the pantry
  const handleSearchChange = async (searchTerm) => { 
  console.log(`Search term: ${searchTerm}`);
  searchTerm = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1).toLowerCase();
  highlightItem(searchTerm);
  };

  return (
    <Box

      width="100vw" 
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      alignItems={'center'}
      gap={2}
      sx={{
          backgroundImage: `url(${backgroundImage.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
          margin: 0,
          padding: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}     
    >
        <Box border = {'1px solid #333'}>    
      </Box>
    <Box border = {'1px solid #333'}>

      <Button variant="contained" onClick={handleOpen} sx={{ width: '33.33%'}}>Add</Button>
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      >
      <Box sx = {style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Add item
        </Typography>
        
        <Stack width="100%" direction = {'row'} spacing ={2}>
          <TextField 
            id = "outlined-basic"
            label="Item" 
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            />

          <Button variant="outlined"
          onClick={() => {
            addItem(itemName)
            setItemName('')
            handleClose()
          }}
          >
            Add
            </Button>
        </Stack>
      </Box>
      </Modal>
        
      <Button variant="contained" onClick={handleOpenSearch} sx={{ width: '33.33%' }}>Search</Button>
      <Modal
      open={openSearch}
      onClose={handleCloseSearch}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      >
      <Box sx = {style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Search
        </Typography>
        
        <Stack width="100%" direction = {'row'} spacing ={2}>
          <TextField 
            id = "outlined-basic"
            label="Item" 
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />

          <Button variant="outlined"
          onClick={() => {
            handleSearchChange(searchTerm)
            setSearchTerm('')
            handleCloseSearch()
          }}
          >
            Search
            </Button>
        </Stack>
      </Box>
      </Modal>

      <Button variant="contained" onClick={handleOpenRecipe} sx={{ width: '33.33%' }}>Suggest recipe</Button>
      <Modal
      open={openRecipe}
      onClose={handleCloseRecipe}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      >
      <Box sx = {style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Suggest recipe
        </Typography>
        
        <Stack width="100%" direction = {'row'} spacing ={2}>
          <TextField 
            id = "outlined-basic"
            label="Enter cuisine type (optional)" 
            variant="outlined"
            fullWidth
            value={cuisineType}
            onChange={(e) => setCuisineType(e.target.value)}
            />

          <Button variant="outlined"
          onClick={() => {
            handleFetchSuggestions(cuisineType)
            setCuisineType('')
            setResponseData(extractContent(responseData))
            console.log("response data: ", responseData)
            handleOpenDialog()
          }}
          >
            Confirm
            </Button>
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Recipe Suggestion</DialogTitle>
        <DialogContent>
          <Card>
            <CardContent fullWidth style={{overflow: 'auto', height: "50vh"}}>
              <Typography variant="body1" component="pre" style={{ whiteSpace: 'pre-wrap' }}>
                
                {
                  <div
                  style={{ whiteSpace: 'pre-wrap' }}

                  dangerouslySetInnerHTML={{ __html:  responseData}}
                  
                  />
                }
              </Typography>
            
          </CardContent>
          </Card>
          </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
        
          
        </Stack>
        
      </Box>
      </Modal>
      
        <Box 
          width="800px" 
          height="100px" 
          bgcolor={'#ADD8E6'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          border={'1px solid #333'}
      >
        
        <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
            Pantry items
              
        </Typography>
         
      </Box> 
      <Stack width="800px" height = "600px" spacing={2} overflow={'auto'}>
        {pantry.map(({name,count}) => (
                    
          <Box
            key={name}
            ref={itemRefs[name]}
            width="100%"
            minHeight="150px"
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
            bgcolor={'#f0f0f0'}
            paddingX={5}
            >
              <Typography
              
                variant={'h4'}
                color={'#333'}
                textAlign={'center'}
                fontWeight={'bold'}
              >
                {
                  //capitalize the first letter of the item
                name.charAt(0).toUpperCase() + name.slice(1)
                }
              </Typography>

              <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                {
                "" + count
                }
              </Typography>
            <Button variant = "contained" onClick={()=> removeItem(name)}> Delete</Button>
            </Box>  
        ))}
      </Stack>
    </Box>
</Box>   

  );
  
  };