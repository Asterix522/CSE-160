class cube extends geometry{
  constructor(){
    super();
    
    //Grid dimensions
    const gridCols = 4;
    const gridRows = 3;
    
    //SIDES TEXTURE (col 0-1, row 1-2)
    const sideColStart = 0;
    const sideColEnd = 1;
    const sideRowStart = 1;
    const sideRowEnd = 2;
    
    //TOP TEXTURE (col 1-2, row 2-3)
    const topColStart = 1;
    const topColEnd = 2;
    const topRowStart = 2;
    const topRowEnd = 3;
    
    //BOTTOM TEXTURE (col 1-2, row 0-1)
    const bottomColStart = 1;
    const bottomColEnd = 2;
    const bottomRowStart = 0;
    const bottomRowEnd = 1;
    
    //Calculate UVs for sides texture
    const sideUMin = sideColStart / gridCols;
    const sideUMax = sideColEnd / gridCols;
    const sideVMin = sideRowStart / gridRows;
    const sideVMax = sideRowEnd / gridRows;
    
    //Flip V for sides texture
    const sideVMinFlipped = 1.0 - sideVMax;
    const sideVMaxFlipped = 1.0 - sideVMin;
    
    //Calculate UVs for top texture
    const topUMin = topColStart / gridCols;
    const topUMax = topColEnd / gridCols;
    const topVMin = topRowStart / gridRows;
    const topVMax = topRowEnd / gridRows;
    
    //Flip V for top texture
    const topVMinFlipped = 1.0 - topVMax;
    const topVMaxFlipped = 1.0 - topVMin;
    
    //Calculate UVs for bottom texture
    const bottomUMin = bottomColStart / gridCols;
    const bottomUMax = bottomColEnd / gridCols;
    const bottomVMin = bottomRowStart / gridRows;
    const bottomVMax = bottomRowEnd / gridRows;
    
    //Flip V for bottom texture
    const bottomVMinFlipped = 1.0 - bottomVMax;
    const bottomVMaxFlipped = 1.0 - bottomVMin;
    

    
    this.vertices = new Float32Array([
        //RIGHT FACE
        1.0, -1.0,  1.0, 1.0, 0.0, 0.0, sideUMax, sideVMaxFlipped,
        1.0, -1.0, -1.0, 1.0, 0.0, 0.0, sideUMin, sideVMaxFlipped,
        1.0,  1.0, -1.0, 1.0, 0.0, 0.0, sideUMin, sideVMinFlipped,
        1.0, -1.0,  1.0, 1.0, 0.0, 0.0, sideUMax, sideVMaxFlipped,
        1.0,  1.0, -1.0, 1.0, 0.0, 0.0, sideUMin, sideVMinFlipped,
        1.0,  1.0,  1.0, 1.0, 0.0, 0.0, sideUMax, sideVMinFlipped,
        
        //LEFT FACE
        -1.0, -1.0, -1.0, 0.0, 1.0, 0.0, sideUMax, sideVMaxFlipped,
        -1.0, -1.0,  1.0, 0.0, 1.0, 0.0, sideUMin, sideVMaxFlipped,
        -1.0,  1.0,  1.0, 0.0, 1.0, 0.0, sideUMin, sideVMinFlipped,
        -1.0, -1.0, -1.0, 0.0, 1.0, 0.0, sideUMax, sideVMaxFlipped,
        -1.0,  1.0,  1.0, 0.0, 1.0, 0.0, sideUMin, sideVMinFlipped,
        -1.0,  1.0, -1.0, 0.0, 1.0, 0.0, sideUMax, sideVMinFlipped,
        
        //BACK FACE
         1.0,  1.0, 1.0, 0.0, 0.0, 1.0, sideUMax, sideVMinFlipped,
        -1.0,  1.0, 1.0, 0.0, 0.0, 1.0, sideUMin, sideVMinFlipped,
        -1.0, -1.0, 1.0, 0.0, 0.0, 1.0, sideUMin, sideVMaxFlipped,
         1.0,  1.0, 1.0, 0.0, 0.0, 1.0, sideUMax, sideVMinFlipped,
        -1.0, -1.0, 1.0, 0.0, 0.0, 1.0, sideUMin, sideVMaxFlipped,
         1.0, -1.0, 1.0, 0.0, 0.0, 1.0, sideUMax, sideVMaxFlipped,
         
         //FRONT FACE
          1.0, -1.0, -1.0, 0.0, 1.0, 1.0, sideUMax, sideVMaxFlipped,
         -1.0, -1.0, -1.0, 0.0, 1.0, 1.0, sideUMin, sideVMaxFlipped,
         -1.0,  1.0, -1.0, 0.0, 1.0, 1.0, sideUMin, sideVMinFlipped,
          1.0, -1.0, -1.0, 0.0, 1.0, 1.0, sideUMax, sideVMaxFlipped,
         -1.0,  1.0, -1.0, 0.0, 1.0, 1.0, sideUMin, sideVMinFlipped,
          1.0,  1.0, -1.0, 0.0, 1.0, 1.0, sideUMax, sideVMinFlipped,
         
         //TOP FACE
          1.0, 1.0, -1.0, 1.0, 1.0, 0.0, topUMax, topVMaxFlipped,
         -1.0, 1.0, -1.0, 1.0, 1.0, 0.0, topUMin, topVMaxFlipped,
         -1.0, 1.0,  1.0, 1.0, 1.0, 0.0, topUMin, topVMinFlipped,
          1.0, 1.0, -1.0, 1.0, 1.0, 0.0, topUMax, topVMaxFlipped,
          1.0, 1.0,  1.0, 1.0, 1.0, 0.0, topUMax, topVMinFlipped,
         -1.0, 1.0,  1.0, 1.0, 1.0, 0.0, topUMin, topVMinFlipped,
         
         //BOTTOM FACE
          1.0, -1.0, -1.0, 1.0, 0.0, 1.0, bottomUMax, bottomVMinFlipped,
         -1.0, -1.0, -1.0, 1.0, 0.0, 1.0, bottomUMin, bottomVMinFlipped,
         -1.0, -1.0,  1.0, 1.0, 0.0, 1.0, bottomUMin, bottomVMaxFlipped,
          1.0, -1.0, -1.0, 1.0, 0.0, 1.0, bottomUMax, bottomVMinFlipped,
          1.0, -1.0,  1.0, 1.0, 0.0, 1.0, bottomUMax, bottomVMaxFlipped,
         -1.0, -1.0,  1.0, 1.0, 0.0, 1.0, bottomUMin, bottomVMaxFlipped,
    ]);
  }

  
}