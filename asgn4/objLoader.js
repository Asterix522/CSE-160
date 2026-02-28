class OBJModel extends Model {
    constructor(color, objData) {
        super(color);
        
        if (objData) {
            this.vertices = new Float32Array(objData.vertices);
            this.normals = new Float32Array(objData.normals);
            this.indices = new Uint16Array(objData.indices);
        }
    }
}

function parseOBJ(objText) {
    const vertices = [];
    const normals = [];
    const texCoords = [];
    const faceVertices = [];
    const faceNormals = [];
    const faceTexCoords = [];
    
    const lines = objText.split('\n');
    let lineCount = 0;
    
    for (let line of lines) {
        line = line.trim();
        lineCount++;
        if (line.length === 0 || line.startsWith('#')) continue;
        
        const parts = line.split(/\s+/);
        const command = parts[0];
        
        if (command === 'v') {
            vertices.push(
                parseFloat(parts[1]),
                parseFloat(parts[2]),
                parseFloat(parts[3])
            );
        } else if (command === 'vn') {
            normals.push(
                parseFloat(parts[1]),
                parseFloat(parts[2]),
                parseFloat(parts[3])
            );
        } else if (command === 'vt') {
            texCoords.push(
                parseFloat(parts[1]),
                parseFloat(parts[2])
            );
        } else if (command === 'f') {
            const faceIndices = [];
            
            for (let i = 1; i < parts.length; i++) {
                if (parts[i].trim() === '') continue;
                
                const faceData = parts[i].split('/');
                
                const vIdx = parseInt(faceData[0]) - 1;
                
                faceIndices.push({
                    v: vIdx,
                    t: faceData.length > 1 && faceData[1] !== '' ? parseInt(faceData[1]) - 1 : -1,
                    n: faceData.length > 2 && faceData[2] !== '' ? parseInt(faceData[2]) - 1 : -1
                });
            }
            
            for (let i = 1; i < faceIndices.length - 1; i++) {
                [0, i, i + 1].forEach(idx => {
                    const f = faceIndices[idx];
                    faceVertices.push(f.v);
                    if (f.t !== -1) faceTexCoords.push(f.t);
                    if (f.n !== -1) faceNormals.push(f.n);
                });
            }
        }
    }
    
    console.log(`Parsed ${vertices.length/3} vertices, ${normals.length/3} normals`);
    console.log(`Generated ${faceVertices.length} face vertices`);
    
    const hasNormals = faceNormals.length > 0 && normals.length > 0;
    const uniqueVertices = [];
    const uniqueNormals = [];
    const uniqueIndices = [];
    
    const vertexMap = new Map();
    let nextIndex = 0;
    
    for (let i = 0; i < faceVertices.length; i++) {
        const vIdx = faceVertices[i];
        
        let key = `${vIdx}`;
        
        if (hasNormals && i < faceNormals.length) {
            const nIdx = faceNormals[i];
            key += `,${nIdx}`;
        }
        
        if (!vertexMap.has(key)) {
            vertexMap.set(key, nextIndex++);
            
            if (vIdx * 3 + 2 < vertices.length) {
                uniqueVertices.push(
                    vertices[vIdx * 3],
                    vertices[vIdx * 3 + 1],
                    vertices[vIdx * 3 + 2]
                );
            } else {
                console.warn(`Vertex index ${vIdx} out of bounds`);
            }
            
            if (hasNormals && i < faceNormals.length) {
                const nIdx = faceNormals[i];
                if (nIdx * 3 + 2 < normals.length) {
                    uniqueNormals.push(
                        normals[nIdx * 3],
                        normals[nIdx * 3 + 1],
                        normals[nIdx * 3 + 2]
                    );
                }
            }
        }
        
        uniqueIndices.push(vertexMap.get(key));
    }
    
    console.log(`Generated ${uniqueVertices.length/3} unique vertices, ${uniqueIndices.length} indices`);
    
    let finalNormals = uniqueNormals;
    if (!hasNormals || uniqueNormals.length === 0) {
        console.log('Generating normals...');
        finalNormals = generateNormals(uniqueVertices, uniqueIndices);
    }
    
    return {
        vertices: uniqueVertices,
        normals: finalNormals,
        indices: uniqueIndices
    };
}

function generateNormals(vertices, indices) {
    const normals = new Array(vertices.length).fill(0);
    
    for (let i = 0; i < indices.length; i += 3) {
        if (i + 2 >= indices.length) break;
        
        const i1 = indices[i] * 3;
        const i2 = indices[i + 1] * 3;
        const i3 = indices[i + 2] * 3;
        
        if (i1 + 2 >= vertices.length || i2 + 2 >= vertices.length || i3 + 2 >= vertices.length) {
            continue;
        }
        
        const v1 = [vertices[i1], vertices[i1 + 1], vertices[i1 + 2]];
        const v2 = [vertices[i2], vertices[i2 + 1], vertices[i2 + 2]];
        const v3 = [vertices[i3], vertices[i3 + 1], vertices[i3 + 2]];
        
        const u = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
        const v = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];
        
        const normal = [
            u[1] * v[2] - u[2] * v[1],
            u[2] * v[0] - u[0] * v[2],
            u[0] * v[1] - u[1] * v[0]
        ];
        
        const len = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]);
        if (len > 0) {
            normal[0] /= len;
            normal[1] /= len;
            normal[2] /= len;
        }
        
        for (let j = 0; j < 3; j++) {
            if (i1 + j < normals.length) normals[i1 + j] += normal[j];
            if (i2 + j < normals.length) normals[i2 + j] += normal[j];
            if (i3 + j < normals.length) normals[i3 + j] += normal[j];
        }
    }
    
    for (let i = 0; i < normals.length; i += 3) {
        const len = Math.sqrt(
            normals[i] * normals[i] + 
            normals[i + 1] * normals[i + 1] + 
            normals[i + 2] * normals[i + 2]
        );
        
        if (len > 0) {
            normals[i] /= len;
            normals[i + 1] /= len;
            normals[i + 2] /= len;
        } else {
            normals[i] = 0;
            normals[i + 1] = 1;
            normals[i + 2] = 0;
        }
    }
    
    return normals;
}

function loadOBJ(url, color, callback) {
    console.log('Loading OBJ from:', url);
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(objText => {
            console.log('OBJ loaded, parsing...');
            const objData = parseOBJ(objText);
            
            console.log('Final vertices:', objData.vertices.length / 3);
            console.log('Final indices:', objData.indices.length);
            console.log('Final normals:', objData.normals.length / 3);
            
            const model = new OBJModel(color, objData);
            callback(model);
        })
        .catch(error => {
            console.error('Error loading OBJ:', error);
        });
}