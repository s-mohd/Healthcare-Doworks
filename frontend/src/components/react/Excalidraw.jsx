import React, { useState, useEffect } from 'react';
import { Excalidraw, Sidebar, exportToBlob, exportToClipboard } from '@excalidraw/excalidraw';
import call from "../../../../../doppio/libs/controllers/call";

import { 
  List, ListItemDecorator, ListItemButton, Tabs, TabList, Tab, TabPanel, Radio, 
  RadioGroup, Sheet, Button, Badge, Option, FormLabel, Input, Card,
} from '@mui/joy';
import { tabClasses } from '@mui/joy/Tab';
import { radioClasses } from '@mui/joy/Radio';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import Select from 'react-select'

const generateFileId = (img) => {
  // Generate a unique fileId using a combination of the image name and a timestamp or any other unique identifier
  return `${img.name}-${Date.now()}`;
};

// let ANNOTTATION_IMAGES;
// call('frappe.client.get_list', {doctype: 'Annotation Template', fields: ['label', 'gender', 'kid', 'image']})
// .then(response => {
//   ANNOTTATION_IMAGES = response
// })

// const Treatments = [
//   {
//     name: 'Laser',
//     color: '#1971c2'
//   },
//   {
//     name: 'Mesotherapy',
//     color: '#ffd43b'
//   },
//   {
//     name: 'Botox',
//     color: '#e03131'
//   },
//   {
//     name: 'Fillers',
//     color: '#69db7c'
//   },
//   {
//     name: 'Neofound',
//     color: '#f783ac'
//   },
//   {
//     name: 'Other',
//     color: '#868e96'
//   },
// ]

// const LaserVariables = [
//   {
//     label: "Fluence", 
//     name: "fluence", 
//     type: "select", 
//     options: [
//       { value: '1', label: '1' },
//       { value: '2', label: '2' },
//       { value: '3', label: '3' },
//       { value: '4', label: '4' },
//       { value: '5', label: '5' },
//       { value: '6', label: '6' },
//       { value: '7', label: '7' },
//       { value: '8', label: '8' },
//       { value: '9', label: '9' },
//     ]
//   },
//   {
//     label: "Spot Size", 
//     name: "spot_size", 
//     type: "select", 
//     options: [
//       { value: '2', label: '2' },
//       { value: '3', label: '3' },
//       { value: '4', label: '4' },
//       { value: '5', label: '5' },
//       { value: '6', label: '6' },
//       { value: '7', label: '7' },
//       { value: '8', label: '8' },
//       { value: '9', label: '9' },
//       { value: '10', label: '10' },
//     ]
//   },
//   {
//     label: "Pulse Duration", 
//     name: "pulse_duration", 
//     type: "select", 
//     options: [
//       { value: '15s', label: '15s' },
//       { value: '20s', label: '20s' },
//       { value: '25s', label: '25s' },
//       { value: '30s', label: '30s' },
//       { value: '35s', label: '35s' },
//       { value: '40s', label: '40s' },
//       { value: '45s', label: '45s' },
//     ]
//   },
//   {
//     label: "Repetition Rate", 
//     name: "repetition_rate", 
//     type: "select", 
//     options: [
//       { value: '1', label: '1' },
//       { value: '2', label: '2' },
//       { value: '3', label: '3' },
//       { value: '4', label: '4' },
//     ]
//   },
//   {
//     label: "No Of Pulses", 
//     name: "no_of_pulses", 
//     type: "select", 
//     options: [
//       { value: '1', label: '1' },
//       { value: '2', label: '2' },
//       { value: '3', label: '3' },
//     ]
//   }
// ]

// const InjectableVars = [
//   {
//     label: 'Injectable',
//     name: 'injectable',
//     type: 'select',
//     options: [
//       { value: 'Botox', label: 'Botox' },
//       { value: 'Fillers', label: 'Fillers' },
//       { value: 'Aethoxysklerol', label: 'Aethoxysklerol' },
//     ]
//   },
//   { 
//     label: 'Lot No', 
//     name: 'lot_no',
//     type: 'data' 
//   },
//   {
//     label: 'Units',
//     name: 'units',
//     type: 'select',
//     options: [
//       { value: '1u', label: '1u' },
//       { value: '2u', label: '2u' },
//       { value: '3u', label: '3u' },
//     ]
//   },
//   {
//     label: 'ML',
//     name: 'ml',
//     type: 'select',
//     options: [
//       { value: '2ml', label: '2ml' },
//       { value: '3ml', label: '3ml' },
//     ]
//   },
// ]

const ExcalidrawWrapper = () => {
  const [index, setIndex] = useState(0);
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const [drawingsSidebar, setDrawingsSidebar] = useState(true);
  const [treatmentSidebar, setTreatmentSidebar] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState('')
  const [newElement, setNewElement] = useState('')
  const [selectedElement, setSelectedElement] = useState('')
  const [variables, setVariables] = useState({})
  const [images, setImages] = useState({male:[], female:[]});
  const [treatments, setTreatments] = useState([]);
  const [annotationsTemplate, setAnnotationsTemplate] = useState('');
  useEffect(() => {
    call('healthcare_doworks.api.methods.annotations_records').then(response => {
      let vars = {}
      response.treatments.forEach(treatment => {
        vars[treatment.treatment] = {}
        treatment.variables.forEach(value => {
          vars[treatment.treatment][value.variable_name] = ''
        })
      })
      setVariables(vars)
      setTreatments(response.treatments)
      setImages({
        male: response.templates.filter(doc => doc.gender === 'Male'),
        female: response.templates.filter(doc => doc.gender === 'Female'),
      })
    })
  }, []);

  useEffect(() => {
    const handleSave = async (event) => {
      if (!excalidrawAPI) {
        return
      }
      const elements = excalidrawAPI.getSceneElements();
      if (!elements || !elements.length) {
        return
      }
      const blob = await exportToBlob({
        elements,
        appState: excalidrawAPI.getAppState(),
        files: excalidrawAPI.getFiles(),
        mimeType: 'image/jpeg'
      });
      await exportToClipboard({
        elements,
        appState: excalidrawAPI.getAppState(),
        files: excalidrawAPI.getFiles(),
        type: 'json'
      })
      const { callback } = event.detail;
      const jsonText = await navigator.clipboard.readText();
      const url = URL.createObjectURL(blob);

      callback({annotationsTemplate, url, jsonText, blob})
    };

    window.addEventListener('vueToReactEvent', handleSave);

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener('vueToReactEvent', handleSave);
    };

  }, [excalidrawAPI, annotationsTemplate]);

  const updateElementCustomData = (target, newVars) => {
    const sceneElements = excalidrawAPI.getSceneElements().map(element => {
      if(element.id === target.id){
        if(newVars)
          element.customData = newVars
        else
          element.customData = {...variables[selectedTreatment], type: selectedTreatment}
      }
      return element
    })
  
    excalidrawAPI.updateScene({
      elements: sceneElements
    })
  }

  const handleExcaliChange = (elements, appState) => {
    const newElements = appState.editingElement
    const cursorButton = appState.cursorButton
    if(treatmentSidebar && selectedTreatment && appState.activeTool.type !== 'freedraw' && appState.activeTool.type !== 'selection' && !selectedElement){
      setSelectedTreatment('')
      // console.log('hi')
      // excalidrawAPI.updateScene({
      //   ...appState,
      //   currentItemStrokeColor: '#1e1e1e',
      // })
      excalidrawAPI.toggleSidebar({name: 'drawings'})
    }
    if (newElements && newElements.type === 'freedraw') {
      setNewElement(newElements)
    }
    if (newElement && cursorButton === 'up' && excalidrawAPI) {
      updateElementCustomData(newElement)    
      setNewElement(null)
    }
  };

  const handleExcaliPointerDown = (activeTool, pointerDownState) => {
    const thisElement = pointerDownState.hit.element;
    if (thisElement && thisElement.type === 'freedraw') {
      console.log('Element selected:', thisElement);
      setVariables({...variables, [thisElement.customData.type]: thisElement.customData})
      setSelectedElement(thisElement)
      setSelectedTreatment(thisElement.customData.type)
    }
    else{
      if(activeTool.type === "selection"){
        setSelectedElement('')
        setSelectedTreatment('')
      }
    }
  };

  const handleDrawModeClick = (treatment) => {
    if (!excalidrawAPI) return;

    setSelectedTreatment(treatment.treatment);
    excalidrawAPI.updateScene({
      appState: {
        ...excalidrawAPI.getAppState(),
        activeTool: {
          type: "freedraw",
        },
        currentItemStrokeColor: treatment.color, // Set your desired stroke color here
      },
      commitToHistory: true,
    });
    // excalidrawAPI.scrollToContent()
    // excalidrawAPI.refresh()
  };

  const handleImageClick = async (img, array, gender) => {
    if (!excalidrawAPI) return;

    const canvasContainer = document.querySelector('.excalidraw__canvas'); // Assuming Excalidraw canvas has this class
    const canvasHeight = canvasContainer.clientHeight;
    const canvasWidth = canvasContainer.clientWidth;
    setAnnotationsTemplate(img.name)
    const image = new Image();
    image.src = img.image;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width; // Set canvas width to image width
      canvas.height = image.height; // Set canvas height to image height
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
  
      const dataURL = canvas.toDataURL('image/jpeg'); // Ensure the data URL is in JPEG format  
      let fileId = img.id;
      if (!img.id) { // Check if fileId exists
        fileId = generateFileId(img); // Generate a unique fileId
        excalidrawAPI.addFiles([{
          mimeType: 'image/jpeg',
          id: fileId,
          dataURL: dataURL,
          created: Date.now(),
        }]);
        const newArray = array.map(val => {
          if (val.image === img.image) val.id = fileId;
          return val;
        });
        setImages({ ...images, [gender]: newArray });
      }

      const scaleFactor = canvasHeight / image.height;
      const imageWidth = image.width * scaleFactor;
      const imageHeight = canvasHeight;
      const imageX = (canvasWidth - imageWidth) / 2;
      const imageY = (canvasHeight - imageHeight) / 2;
  
      const imageElement = {
        type: 'image',
        version: 1,
        versionNonce: 123456,
        isDeleted: false,
        id: img.label,
        fillStyle: 'solid',
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 100,
        angle: 0,
        x: imageX,
        y: imageY,
        width: image.width, // Set width to image width
        height: image.height, // Set height to image height
        seed: 1,
        groupIds: [], // Initialize groupIds as an empty array
        dataURL: dataURL, // Ensure the property is correctly named dataURL
        status: 'pending', // Match the status of the successful image
        backgroundColor: 'transparent', // Set a default background color
        strokeColor: 'transparent', // Set a default stroke color
        boundElements: null, // Match the boundElements property
        customData: undefined, // Match the customData property
        fileId: fileId,
        frameId: null, // Match the frameId property
        link: null, // Match the link property
        locked: true, // Match the locked property
        roundness: null, // Match the roundness property
        scale: [scaleFactor, scaleFactor], // Set scale to fit height
        updated: Date.now(), // Use the current timestamp for the updated property
      };
  
      excalidrawAPI.updateScene({
        elements: [imageElement],
        commitToHistory: true,
      });
      excalidrawAPI.scrollToContent()
      excalidrawAPI.refresh()
    };
  
    image.onerror = (error) => {
      console.error('Failed to load image:', error);
    };
  };

  return (
    <div style={{ height: '100%' }}>
      <div className={'excalidraw-wrapper ' + (selectedTreatment ? 'leftdrawer-open' : '')} style={{ height: '100%', position: 'relative'}}>
        {selectedTreatment && <Card variant='soft' sx={{ width: 240, zIndex: 10, marginTop: '40px', height: 'fit-content', position: 'absolute'}}>
          {treatments.find(treatment => treatment.treatment == selectedTreatment).variables.map((variable, index) => {
            if(variable.type === 'Select'){
              let optionsArray = variable.options.split('\n')
              variable.selectOptions = optionsArray.map(option => {return {label: option, value: option}})
            }
            return <div key={index}>
              <FormLabel>{variable.variable_name}</FormLabel>
              {variable.type === 'Select' ? 
                <Select 
                name={variable.variable_name}
                isClearable
                value={variable.selectOptions.find(option => option.value === variables[selectedTreatment][variable.variable_name]) || ''}
                onChange={(selectedOption) => {
                  const newVars = {
                    ...variables[selectedTreatment],
                    [variable.variable_name]: selectedOption ? selectedOption.value : ''
                  }
                  setVariables({...variables, [selectedTreatment]: newVars});
                  if(selectedElement)
                    updateElementCustomData(selectedElement, newVars)
                }}
                options={variable.selectOptions}
                />
              : variable.type === 'Data' ? <Input value={variables[selectedTreatment][variable.variable_name]} onChange={event => {
                const newVars = {
                  ...variables[selectedTreatment],
                  [variable.variable_name]: event.target.value
                }
                setVariables({...variables, [selectedTreatment]: newVars});
                if(selectedElement)
                  updateElementCustomData(selectedElement, newVars)
              }}/> 
              : <></>}
            </div>
          })}
        </Card>}
        <Excalidraw
        onChange={handleExcaliChange}
        onPointerDown={handleExcaliPointerDown}
        excalidrawAPI={(api)=> setExcalidrawAPI(api)}
        initialData={{
          elements: [],
          appState: {
            openSidebar: { name: 'drawings' },
          },
          scrollToContent: true
        }}
        renderTopRightUI={() => { 
          return (
            <>
              {!drawingsSidebar && <Button name="drawings" variant="soft" onClick={() => {excalidrawAPI.toggleSidebar({name: 'drawings'})}}>
                Drawings
              </Button>}
              {!treatmentSidebar && <Button 
              name="treatments" 
              color="success" 
              variant="soft" 
              onClick={() => {excalidrawAPI.toggleSidebar({name: 'treatments'})}}
              >
                Treatments
              </Button>}
            </>
          );
        }}
        >
          <Sidebar name="drawings" className='drawings-sidebar' docked onStateChange={setDrawingsSidebar}>
            <Sidebar.Tabs>
              <Tabs
                value={index}
                onChange={(event, value) => setIndex(value)}
                sx={(theme) => ({
                  m: 1,
                  borderRadius: 16,
                  height: '100%',
                  boxShadow: theme.shadow.md,
                  
                  [`& .${tabClasses.root}`]: {
                    py: 1,
                    flex: 1,
                    transition: '0.3s',
                    fontWeight: 'md',
                    fontSize: 'md',
                    [`&:not(.${tabClasses.selected}):not(:hover)`]: {
                      opacity: 0.7,
                    },
                  },
                })}
              >
                <TabList
                  variant="plain"
                  size="sm"
                  disableUnderline
                  sx={{ borderRadius: 'xl', p: 2 }}
                >
                  <Tab
                    disableIndicator
                    {...(index === 0 && { color: 'primary' })}
                  >
                    Male
                  </Tab>
                  <Tab
                    disableIndicator
                    {...(index === 1 && { color: 'danger' })}
                  >
                    Female
                  </Tab>
                </TabList>
                <TabPanel value={0} sx={{ p: 0 }}>
                  <div>
                    <List>
                      {images.male.map((img, index, array) => (
                        <ListItemButton key={img.label} onClick={() => {handleImageClick(img, array, 'male')}}>
                          <ListItemDecorator>
                            <img src={img.image} alt={img.label} style={{ width: '50px', height: '50px', marginRight: '15px' }} />
                          </ListItemDecorator>
                          {img.label}
                        </ListItemButton>
                      ))}
                    </List>
                  </div>
                </TabPanel>
                <TabPanel value={1} sx={{ p: 0 }}>
                  <div>
                    <List>
                      {images.female.map((img, index, array) => (
                        <ListItemButton key={img.label} onClick={() => {handleImageClick(img, array, 'female')}}>
                          <ListItemDecorator>
                            <img src={img.image} alt={img.label} style={{ width: '50px', height: '50px', marginRight: '15px' }} />
                          </ListItemDecorator>
                          {img.label}
                        </ListItemButton>
                      ))}
                    </List>
                  </div>
                </TabPanel>
              </Tabs>
            </Sidebar.Tabs>
          </Sidebar>

          <Sidebar name="treatments" className='treatments-sidebar' docked onStateChange={setTreatmentSidebar}>
            <RadioGroup
            overlay
            name="treatments"
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              flexDirection: 'row',
              padding: '1rem',
              gap: 2,
              [`& .${radioClasses.checked}`]: {
                [`& .${radioClasses.action}`]: {
                  inset: -1,
                  border: '3px solid',
                  borderColor: 'primary.500',
                },
              },
              [`& .${radioClasses.radio}`]: {
                display: 'contents',
                '& > svg': {
                  zIndex: 2,
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  bgcolor: 'background.surface',
                  borderRadius: '50%',
                },
              },
            }}
            >
              {treatments.map((value, index) => (
                <Sheet
                  key={index}
                  variant="outlined"
                  sx={{
                    borderRadius: 'md',
                    boxShadow: 'sm',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 2,
                    minWidth: 120,
                  }}
                  onClick={() => {handleDrawModeClick(value)}}
                >
                  <Badge sx={{
                    marginRight: 'auto',
                    ['& .MuiBadge-badge']: {
                      backgroundColor: value.color
                    }
                  }}>
                  </Badge>
                  <Radio id={value.treatment} value={value.treatment} checkedIcon={<CheckCircleRoundedIcon />}/>
                  {value.treatment}
                </Sheet>
              ))}
            </RadioGroup>
          </Sidebar>
        </Excalidraw>
      </div>
    </div>
  );
};

export default ExcalidrawWrapper;