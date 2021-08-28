everything tens to be driven by models
FACEasy is the tailored version of FACE to EZ-1. T
Msot of what was defined for face might not be aplicable to ez-1, as it is a small vehicle with a  lot of limitations.
FACE is an architecture (acronym will be provided soon)

the val will implement the cmomuncation to the hardware to turn on and off 
ams is smoething more composite

ideally, we should try to communicate to the ams before communicating with val

the ego is the vehicle itself. generic state of the vehicle. power states of the car and things like that. Position, velocity. If you take an image of the vehicle. 




today we have autosar as our mainsoftware architecture, but we dont know how it will  be in the future.
renaul doesn't want this developers to be specialists in every 

FIDL (FRAncAAA???) is used to define the interface of the components it is agnostic and is used to define the interface of your component
it is an open standard, not only renault uses it

RNIDL uses FIDL to define the interface of swc, but it also defines the behaviour of the swc. (methods, runnables, which type of basic software each software whould need (memory, can comunication)).

we don't want to use the hardware to test our software


jeff's important points
- great job :)
- using what we got
- some recomendations
    - question that is off topic
    - we are going to have automotive academy in september, João should enroll in the autosar training.
    - stucture these guidelines.
- expectations:
    - guidlines should be split in chapters
        - detail design
        - software development
        - unit testing 
        - software integration
        - integration testing
        - validation

    - for eachc chapter: inputs,  process,  outcomes, acceptance criteria
    - regarding the quality, maybe we can send it to renault.
- for questions, there are no stupid questions.
- final point regarding the access
    - of course everyone needs it
    - we need to reset our IPN. We need to ask our colleague in france 
- do the video after the documentation.
- they will try to provide with you

- the reason why we couldn't use std libraries we because of performance
when we are done we make it more 




we havent GoogleTest GMock.