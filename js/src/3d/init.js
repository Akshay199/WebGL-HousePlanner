function initHousePlanner() {

    if (!Detector.webgl)
    {
        //Detector.addGetWebGLMessage();
        var html = "<br/><br/><br/><div><center><img src='images/webgl.gif' /><h1>Looks like you broke the Internet!</h1><br/><h2>...your WebGL not enabled?</h2>";

        if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){
            $('body').append(html + "<br/><br/>You are running Internet Explorer, the browser does not support WebGL, please install one of these popular browsers<br/><br/><a href='http://www.mozilla.org/en-US/firefox'><img src='images/firefox.png'/></a> <a href='http://www.google.ca/chrome'><img src='images/chrome.png'/></a></center></div>");
        }else if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)){
            $('body').append(html + "<img src='images/firefox-webgl.png'/></center></div>");
        //}else  if (/Version\/[\d\.]+.*Safari/.test(navigator.userAgent)){
            //$('body').append(html + "<img src='images/safari-webgl.png'/></center></div>");
        }
        $("#menuTop").hide();
        $("#menuBottom").hide();

        document.getElementsByTagName("body")[0].style.overflow = "auto";
        document.getElementsByTagName("html")[0].style.overflow = "auto";
        return;
    }

    if (getCookie("firstTimer"))
    {
        createCookie("firstTimer","1",15);
        window.location.href = "#start";
    }
    else
    {
        window.location.href = "#scene";
    }

	//RUNMODE = runmode;
	//VIEWMODE = viewmode;

    if(RUNMODE == "local")
    {
        $("#menuTopItem12").hide(); //Share
        $("#menuTopItem15").hide(); //Login
    }

    $("#menuTop").show();
    $("#menuBottom").show();

    // workaround for chrome bug: http://code.google.com/p/chromium/issues/detail?id=35980#c12
    if (window.innerWidth === 0) {
        window.innerWidth = parent.innerWidth;
        window.innerHeight = parent.innerHeight;
    }

    spinner.className = "cssload-container";
    spinner.setAttribute("style","position:absolute;top:32%;left:40%;");
    spinner.innerHTML = "<ul class='cssload-flex-container'><li><span class='cssload-loading'></span></li></ul>";
    
    /*
	http://www.ianww.com/blog/2012/12/16/an-introduction-to-custom-shaders-with-three-dot-js/
	huge improvement in smoothness of the simulation by writing a custom shader for my particle system.
	This effectively moved all the complex position calculations for particles to the GPU, which went
	a long way toward ensuring the speed and reliability of the simulation. Custom shaders are written in GLSL,
	which is close enough to C that it’ s not too difficult to translate your math into.
	*/

    projector = new THREE.Projector();
    //zip = new JSZip();
    clock = new THREE.Clock();
    mouse = new THREE.Vector2();
    touch = new THREE.Vector2();
    target = new THREE.Vector3();

    scene3DFloorGroundContainer = new THREE.Object3D();
    scene3DPivotPoint = new THREE.Object3D();
    //scene3DAxisHelper = new THREE.AxisHelper(2);

    var geometry = new THREE.BoxGeometry( 15, 15, 3 ); //new THREE.PlaneGeometry(15, 15,3);
    geometry.computeBoundingBox();
    material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    scene3DCutawayPlaneMesh = new THREE.Mesh(geometry, material);

    /*
    particlePivot = new SPE.Group({});
    particleWeather = new SPE.Group({});
    //weatherRainParticle = new SPE.Group({});

    // Create particle emitter 0
    particlePivotEmitter = new SPE.Emitter( {
        type: 'cube',
        particleCount: 30, //particlesPerSecond
        position: new THREE.Vector3(0, 0, 0),
        positionSpread: new THREE.Vector3( 0, 0, 0 ),
        acceleration: new THREE.Vector3( 0, 0, 0 ),
        accelerationSpread: new THREE.Vector3( 0, 0, 0 ),
        velocity: new THREE.Vector3( 0, 3, 0 ),
        velocitySpread: new THREE.Vector3(3, 0, 3),
        sizeStart: 0,
        sizeStartSpread: 0.02,
        sizeMiddle: 1,
        sizeMiddleSpread: 0,
        sizeEnd: 1,
        sizeEndSpread: 0.4,
        angleStart: 0,
        angleStartSpread: 180,
        angleMiddle: 180,
        angleMiddleSpread: 0,
        angleEnd: 0,
        angleEndSpread: 360 * 4,
        angleAlignVelocity: false,
        colorStart: new THREE.Color( 0xffffff ),
        colorStartSpread: new THREE.Vector3(0, 0, 0),
        colorMiddle: new THREE.Color( 0xffffff ),
        colorMiddleSpread: new THREE.Vector3( 0, 0, 0 ),
        colorEnd: new THREE.Color( 0xffffff ),
        colorEndSpread: new THREE.Vector3(0, 0, 0),
        opacityStart: 1,
        opacityStartSpread: 0,
        opacityMiddle: 0.5,
        opacityMiddleSpread: 0,
        opacityEnd: 0,
        opacityEndSpread: 0,
        duration: null,
        alive: 0,
        isStatic: 0
    });
    */

    //FIND TRUE MESH CENTER
    /*
    geometry.centroid = new THREE.Vector3();
    for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {
        geometry.centroid.addSelf( geometry.vertices[ i ].position );
    }
    geometry.centroid.divideScalar( geometry.vertices.length );
    */

    /*
    (function(watchedKeyCodes) {
        var handler = function(down) {
            return function(e) {
                var index = watchedKeyCodes.indexOf(e.keyCode);
                if (index >= 0) {
                    keysPressed[watchedKeyCodes[index]] = down; e.preventDefault();
                }
            };
        }
        $(document).keydown(handler(true));
        $(document).keyup(handler(false));
    })([
        keys.SP, keys.W, keys.A, keys.S, keys.D, keys.UP, keys.LT, keys.DN, keys.RT
    ]);
    */

    /*
    Cutaway View - width, height, fov, near, far, orthoNear, orthoFar
    https://github.com/mrdoob/three.js/issues/1909
    https://github.com/chandlerprall/ThreeCSG
    */
    //camera3D = new THREE.CombinedCamera( window.innerWidth, window.innerHeight, 60, 0.1, 80, 1.5, 10);
    /*
    var tween = new TWEEN.Tween(camera3D.position).to({x:Math.cos(0.1) * 200, z:Math.sin(0.1) * 200},20000).easing(TWEEN.Easing.Quadratic.InOut).onUpdate(function() {
            //camera3D.updateProjectionMatrix();
            camera3D.lookAt(scene3D.position);
    }).start();
    */

    //camera3D.lookAt(new THREE.Vector3(0, 0, 0));
    //camera2D = new THREE.PerspectiveCamera(1, window.innerWidth / window.innerHeight, 1, 5000);
    //camera2D.lookAt(new THREE.Vector3(0, 0, 0));
    //camera2D.position.z = 5000; // the camera starts at 0,0,0 so pull it back

    /*
    camera3DMirrorReflection = new THREE.CubeCamera(0.1, 10, 30);
    //camera3DMirrorReflection.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
    camera3DMirrorReflection.renderTarget.width = camera3DMirrorReflection.renderTarget.height = 3;
    //camera3DMirrorReflection.position.y = -20;
    */

    //================================

    /*
    scene3DWallInteriorTextureDefault = new THREE.ImageUtils.loadTexture('objects/Platform/Textures/C0001.jpg');
    scene3DWallInteriorTextureDefault.minFilter = THREE.LinearFilter;
    scene3DWallInteriorTextureDefault.wrapS = THREE.RepeatWrapping;
    scene3DWallInteriorTextureDefault.wrapT = THREE.RepeatWrapping;
    */

    /*
    scene2DDrawLineGeometry = new THREE.Geometry();
    scene2DDrawLineMaterial = new THREE.LineBasicMaterial({
        color: 0x000000,
        linewidth: 5,
        linecap: "round",
        //linejoin: "round"
        //opacity: 0.5
    });
    scene2DDrawLineDashedMaterial = new THREE.LineDashedMaterial({
        color: 0x000000,
        dashSize: 1,
        gapSize: 0.5
    });

    scene2DDrawLine = new THREE.Line(scene2DDrawLineGeometry, scene2DDrawLineMaterial);
    scene2DDrawLineContainer.add(scene2DDrawLine);
    
    texture = new THREE.ImageUtils.loadTexture('objects/FloorPlan/P0001.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    scene2DWallRegularMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        color: 0x000066,
        linewidth: 2,
        //wireframe: true,
        //wireframeLinewidth: 4
    });

    texture = new THREE.ImageUtils.loadTexture('objects/FloorPlan/P0002.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    scene2DWallRegularMaterialSelect = new THREE.MeshBasicMaterial({
        map: texture
    });
	*/

    var cubeMaterials = [
        new THREE.MeshBasicMaterial({
            color: 0x33AA55,
            transparent: true,
            opacity: 0.9,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors,
        }),
        new THREE.MeshBasicMaterial({
            color: 0x55CC00,
            transparent: true,
            opacity: 0.9,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors
        }),
        new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.9,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors
        }),
        new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.9,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors
        }),
        new THREE.MeshBasicMaterial({
            color: 0x0000FF,
            transparent: true,
            opacity: 0.9,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors
        }),
        new THREE.MeshBasicMaterial({
            color: 0x5555AA,
            transparent: true,
            opacity: 0.9,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors
        }),
    ];
    material = new THREE.MeshFaceMaterial(cubeMaterials);
    material.vertexColors = THREE.FaceColors;

    geometry = initCube(8); //new THREE.BoxGeometry(10, 10, 10, 1, 1, 1)
    geometry.computeLineDistances();

    scene3DCubeMesh = new THREE.Line(geometry, new THREE.LineDashedMaterial({
        color: 0xff3700,
        dashSize: 3,
        gapSize: 1,
        linewidth: 2
    }), THREE.LineSegments); //v72
    //}), THREE.LinePieces); //v71

    //scene3DCubeMesh = new THREE.Mesh(cubeG, material);
    scene3DCubeMesh.geometry.dynamic = true; //Changing face.color only works with geometry.dynamic = true

   
    //THREE.GeometryUtils.merge(geometry, mesh);

    //scene2D.add(new THREE.GridHelper(100, 10));

    //A 1x1 Rectangle for Scale - Should Map to a 1x1 square of Three.js space
    //scene2D.fillStyle = "#FF0000";
    //scene2D.fillRect(0, 0, 1, 1);

    scene3DInitializeRenderer();

    scene3DInitializePhysics();

    scene3DInitializeGround();

    scene3DInitializeWater();

    scene3DInitializeClouds();

    scene2DInitializeRenderer();

    sceneNew();

    //automatically resize renderer THREE.WindowResize(renderer, camera); toggle full-screen on given key press THREE.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
    $(window).bind('resize', onWindowResize);
    $(window).bind('beforeunload', function() {
        return 'Are you sure you want to leave?';
    });

    //$("#HTMLCanvas").bind('mousedown', on2DMouseDown);
    //$("#HTMLCanvas").bind('mouseup', on2DMouseUp);

    /*
    document.addEventListener('dragover', function(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }, false);

    document.addEventListener('drop', function(event) {
        event.preventDefault();
        editor.loader.loadFile(event.dataTransfer.files[0]);
    }, false);
    */

    /*
    $(window).bind('mousedown', function(event) {
         switch (event.keyCode) {
            case 8: // prevent browser back 
                event.preventDefault();
                break;
            case 46: // delete
                //editor.removeObject(editor.selected);
                //editor.deselect();
                break;
        }
    });
    */
    
   	scene3DenableOrbitControls(camera3D,renderer.domElement);

    /*
    manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {
        //console.log( item, loaded, total );
        //var material = new THREE.MeshFaceMaterial(materials);
    };
    */
    //scene3DSky();
    scene3DInitializeLights();

    $('#menuWeatherText').html("Sunny");
    $('#menuDayNightText').html("Day");

    //animateHouse();

    open3DModel("objects/Platform/floor.jsz", scene3DFloorGroundContainer, 0, 0, 0, 0, 0, 1, false, null);
    open3DModel("objects/Landscape/round.jsz", scene3DHouseGroundContainer, 0, 0, 0, 0, 0, 1, true, null);
    open3DModel("objects/Platform/pivotpoint.jsz", scene3DPivotPoint, 0, 0, 0.1, 0, 0, 1, false, null);


    //scene3DInitializePostprocessing();

    show3DHouse();

    //For debugging purposes
    //========================
    //sceneOpen('scene2.zip');
    //========================

}

function scene3DInitializeRenderer()
{
    /*
    https://www.udacity.com/course/viewer#!/c-cs291/l-158750187/m-169414761
    */
    //VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
    camera3D = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 80);

    scene3DCube = new THREE.Scene();
    camera3DCube = new THREE.PerspectiveCamera(60, 1, 1, 50);
    camera3DCube.up = camera3D.up;

    //scene3DCube.add(camera3DCube);
    scene3DCube.add(scene3DCubeMesh);

    //$(rendererCube.domElement).bind('mousemove', onCubeMouseMove);

    dpr = 1;
    if (window.devicePixelRatio !== undefined) {
      dpr = window.devicePixelRatio;
    }

    renderer = new THREE.WebGLRenderer({
        devicePixelRatio: dpr,
        antialias: false,
        //alpha: true,
        //alpha: false,
        //preserveDrawingBuffer: false
        //autoUpdateObjects: true
    });

    //renderer.autoClear = false; //REQUIRED: for split screen
    
    renderer.shadowMap.enabled = true; //shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    renderer.shadowMapAutoUpdate = true;
    
    //renderer.shadowMap.debug = true; //shadowMapDebug = true;
    //renderer.shadowMapType = THREE.PCFShadowMap; //THREE.PCFSoftShadowMap; //THREE.BasicShadowMap;

    //renderer.gammaInput = true;
    //renderer.gammaOutput = true;
    
    /*
    renderer = new THREE.WebGLDeferredRenderer({
        width: window.innerWidth,
        height: window.innerHeight,
        scale: 1,
        antialias: true,
        tonemapping: THREE.UnchartedOperator,
        brightness: 2.5
    });
    */
    renderer.setSize(window.innerWidth, window.innerHeight);
    //renderer.sortObjects = false; //http://stackoverflow.com/questions/15994944/transparent-objects-in-threejs
    //renderer.physicallyBasedShading = true;
    //renderer.sortObjects = true; //when scene is opening this make sure clouds stay on top
    //renderer.setClearColor(0xffffff, 1);

    rendererCube = new THREE.WebGLRenderer({
        devicePixelRatio: dpr,
        antialias: false,
        alpha: true,
        //transparent: true,
        //preserveDrawingBuffer: false
    });
    rendererCube.setSize(100, 100);
    
    document.getElementById('WebGLCanvas').appendChild(renderer.domElement);
    document.getElementById('WebGLCubeCanvas').appendChild(rendererCube.domElement);
}

function scene3DInitializeRendererQuad()
{
    $('div.split-pane').splitPane();

    for(i = 0; i<4; i++){

        rendererQuad[i] = new THREE.WebGLRenderer({
            devicePixelRatio: dpr,
            antialias: false,
            //alpha: true,
            //autoClear: false
        });
        rendererQuad[i].setClearColor( 0xffffff );
        $('#WebGLSplitCanvas-' + i).append(rendererQuad[i].domElement);

        //var w = $("#WebGLSplitCanvas-" + i).parent().parent().width();
        //var h = $("#WebGLSplitCanvas-" + i).parent().parent().height();
        //camera3DQuad[i] = new THREE.OrthographicCamera( w / - 2, w / 2, h / 2, h / - 2, -30, 30 );
    }

    //Top View Camera
    camera3DQuad[0] = new THREE.OrthographicCamera( $("#WebGLSplitCanvas-0").parent().parent().width() / - 60, $("#WebGLSplitCanvas-0").parent().parent().width() / 60, $("#WebGLSplitCanvas-0").parent().parent().height() / 10, $("#WebGLSplitCanvas-0").parent().parent().height() / - 10, -30, 30 );
    camera3DQuad[0].up = new THREE.Vector3(0, 0, -1);
    camera3DQuad[0].lookAt(new THREE.Vector3(0, -1, 0));

    //Front View Camera
    camera3DQuad[1] = new THREE.OrthographicCamera( $("#WebGLSplitCanvas-1").parent().parent().width() / - 60, $("#WebGLSplitCanvas-1").parent().parent().width() / 60, $("#WebGLSplitCanvas-1").parent().parent().height() / 10, $("#WebGLSplitCanvas-1").parent().parent().height() / - 10, -30, 30 );
    //camera3DQuad[1].lookAt(new THREE.Vector3(0, 0, -1));
    //camera3DQuad[1].position.set(0, 0, 0);
    camera3DQuad[1].lookAt(new THREE.Vector3(1, 0, 0));
    camera3DQuad[1].position.set(0, 0, 0);

    //Side View Camera
    camera3DQuad[2] = new THREE.OrthographicCamera( $("#WebGLSplitCanvas-2").parent().parent().width() / - 60, $("#WebGLSplitCanvas-2").parent().parent().width() / 60, $("#WebGLSplitCanvas-2").parent().parent().height() / 10, $("#WebGLSplitCanvas-2").parent().parent().height() / - 40, -30, 30 );
    camera3DQuad[2].lookAt(new THREE.Vector3(1, 0, 0));
    camera3DQuad[2].position.set(0, 0, 0);

    //3D View Camera
    camera3DQuad[3] = new THREE.PerspectiveCamera(70, $("#WebGLSplitCanvas-3").parent().width() / $("#WebGLSplitCanvas-3").parent().height(), 1, 50);
    camera3DQuad[3].position.set(0, 14, 8);
    camera3DQuad[3].lookAt(new THREE.Vector3(0, 0, 0));

    camera3DQuadGrid = new THREE.GridHelper(15, 1);
    camera3DQuadGrid.setColors(new THREE.Color(0x000066), new THREE.Color(0x6dcff6));

    scene3DInitializeRendererQuadSize();

    //controls3DDebug = new THREE.OrbitControls(camera3DQuad[0], rendererQuad[0].domElement);
    //controls3DDebug.enabled = true;

    /*
    var pane = $('div.split-pane').children('.split-pane-divider');

    function triggerSplitterDrop (vDrop) {
        var offset = pane.offset();
        var ev = {
            which: 1,
            pageX: offset.left,
            pageY: offset.top
        };
        var mdEvent = $.Event('mousedown', ev);

        ev.pageY = vDrop || offset.top;
        var mmEvent = $.Event('mousemove', ev);
        var muEvent = $.Event('mouseup', ev);

        pane.trigger(mdEvent);
        pane.trigger(mmEvent);
        pane.trigger(muEvent);
    }
    */
}

function scene3DInitializeRendererQuadSize()
{
    if(camera3DQuad[0] instanceof THREE.OrthographicCamera)
    {
        for(i = 0; i<4; i++){
           
            var w = $("#WebGLSplitCanvas-" + i).parent().parent().width();
            var h = $("#WebGLSplitCanvas-" + i).parent().parent().height();
            //console.log(w+ ":" + h);

            camera3DQuad[i].aspect = w / h;
            camera3DQuad[i].updateProjectionMatrix();
            rendererQuad[i].setSize(w, h);
        }
    }
}

function scene3DInitializePostprocessing()
{
    //if(!(effectComposer instanceof THREE.EffectComposer)){
        console.log("init EffectComposer");
        effectComposer = new THREE.EffectComposer( renderer );
        effectComposer.setSize(window.innerWidth * dpr, window.innerHeight * dpr);

        var renderPass = new THREE.RenderPass( scene3D, camera3D ); // Setup render pass
        effectComposer.addPass( renderPass );
    //}

    if(SSAOProcessing.enabled) // && !(SSAOPass instanceof THREE.ShaderPass))
    {
        console.log("init SSAOShader");
        // Setup depth pass
        var depthShader = THREE.ShaderLib[ "depthRGBA" ];
        var depthUniforms = THREE.UniformsUtils.clone( depthShader.uniforms );
        depthMaterial = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms, blending: THREE.NoBlending } );
        depthRenderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter } );

        // Setup SSAO pass
        SSAOPass = new THREE.ShaderPass( THREE.SSAOShader );
        SSAOPass.renderToScreen = true;

        //ssaoPass.uniforms[ "tDiffuse" ].value will be set by ShaderPass
        SSAOPass.uniforms[ "tDepth" ].value = depthRenderTarget;
        SSAOPass.uniforms[ 'size' ].value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));
        SSAOPass.uniforms[ 'cameraNear' ].value = camera3D.near;
        SSAOPass.uniforms[ 'cameraFar' ].value = camera3D.far;
        SSAOPass.uniforms[ 'onlyAO' ].value = ( SSAOProcessing.renderMode == 1 );
        SSAOPass.uniforms[ 'aoClamp' ].value = 0.3;
        SSAOPass.uniforms[ 'lumInfluence' ].value = 0.5;

        effectComposer.addPass( SSAOPass ); // Add pass to effect composer
    }

    /*
    if ( value == 0 ) { // framebuffer
        ssaoPass.uniforms[ 'onlyAO' ].value = false;
    } else if ( value == 1 ) {  // onlyAO
        ssaoPass.uniforms[ 'onlyAO' ].value = true;
    } else {
        console.error( "Not define renderModeChange type: " + value );
    }
    */

    if(FXAAProcessing.enabled) // && !(FXAAPass instanceof THREE.ShaderPass))
    {
        console.log("init FXAAShader");
        FXAAPass = new THREE.ShaderPass(THREE.FXAAShader);
        FXAAPass.uniforms.resolution.value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));
        FXAAPass.renderToScreen = true;

        effectComposer.addPass(FXAAPass); // Add pass to effect composer
    }
}


function scene3DInitializeWater()
{

}

function scene3DInitializeGround()
{
    /*
    //var texture = THREE.ImageUtils.loadTexture('assets/combined.png', null, loaded); // load the heightmap we created as a texture
    var detailTexture = THREE.ImageUtils.loadTexture('objects/Landscape/Textures/G36096.jpg'); //, null, loaded);  // load two other textures we'll use to make the map look more real

    terrainShader = THREE.ShaderTerrain[ "terrain" ];
    uniformsTerrain = THREE.UniformsUtils.clone(terrainShader.uniforms);

    // how to treat abd scale the normal texture
    uniformsTerrain[ "tNormal" ].texture = detailTexture;
    uniformsTerrain[ "uNormalScale" ].value = 0.5;

    // displacement is heightmap (greyscale image)
    //uniformsTerrain[ "tDisplacement" ].value = texture;
    //uniformsTerrain[ "uDisplacementScale" ].value = 15;

    // the following textures can be use to finetune how the map is shown. These are good defaults for simple rendering
    uniformsTerrain[ "tDiffuse1" ].value = detailTexture;
    uniformsTerrain[ "tDetail" ].texture = detailTexture;
    uniformsTerrain[ "enableDiffuse1" ].value = true;
    //uniformsTerrain[ "enableDiffuse2" ].value = true;
    //uniformsTerrain[ "enableSpecular" ].value = true;

    // diffuse is based on the light reflection
    //uniformsTerrain[ "uDiffuseColor" ].value.setHex(0xcccccc);
    //uniformsTerrain[ "uSpecularColor" ].value.setHex(0xff0000);

    // is the base color of the terrain
    //uniformsTerrain[ "uAmbientColor" ].value.setHex(0x0000cc);
 
    // how shiny is the terrain
    //uniformsTerrain[ "uShininess" ].value = 3;

    // handles light reflection
    //uniformsTerrain[ "uRepeatOverlay" ].value.set(3, 3);

    terrain3DMaterial = new THREE.ShaderMaterial({
        uniforms:       uniformsTerrain,
        vertexShader:   terrainShader.vertexShader,
        fragmentShader: terrainShader.fragmentShader,
        lights:         true,
        fog:            false
    });

    var geometryTerrain = new THREE.PlaneGeometry( 40, 40);
    //geometryTerrain.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    geometryTerrain.computeFaceNormals();
    geometryTerrain.computeVertexNormals();
 
    terrain3D = new THREE.Mesh(geometryTerrain, terrain3DMaterial);
    terrain3D.rotation.x = -Math.PI / 2;
    */

    $.ajax({
        url: "shaders/ground.vertex.fx",
        beforeSend: function (req) {
            req.overrideMimeType('text/plain; charset=x-shader/x-vertex'); //important - set for binary!
        },
        success: function(ground_vertex_data){
            $.ajax({
                url: "shaders/ground.fragment.fx",
                beforeSend: function (req) {
                    req.overrideMimeType('text/plain; charset=x-shader/x-fragment'); //important - set for binary!
                },
                success: function(ground_fragment_data){

                    terrain3DMaterial = new THREE.ShaderMaterial({
                        uniforms: {
                            texture_grass: { type: "t", value: THREE.ImageUtils.loadTexture( 'objects/Landscape/Textures/G36096.jpg' )},
                            texture_bare: { type: "t", value: THREE.ImageUtils.loadTexture( 'objects/Landscape/Textures/F46734.jpg' )},
                            texture_snow: { type: "t", value: THREE.ImageUtils.loadTexture( 'objects/Landscape/Textures/F46734.jpg' ) },
                            show_ring: { type: 'i', value: true },
                            ring_width: { type: 'f', value: 0.15 },
                            ring_color: { type: 'v4', value: new THREE.Vector4(1.0, 0.0, 0.0, 1.0) },
                            ring_center: { type: 'v3', value: new THREE.Vector3() },
                            ring_radius: { type: 'f', value: 1.6 }
                        },
                        vertexShader: ground_vertex_data,
                        fragmentShader: ground_fragment_data,
                        //fog: false,
                        //lights: true
                    });
                    var geometry = new THREE.PlaneBufferGeometry( plots_x, plots_y, plots_x * plot_vertices, plots_y * plot_vertices);
                    
                    var numVertices = geometry.attributes.position.count;
                    var displacement = new THREE.Float32Attribute(numVertices * 1, 1);
                    geometry.addAttribute( 'displacement', displacement);

                    terrain3D = new THREE.Mesh(geometry, terrain3DMaterial);
                    terrain3D.displacement = geometry.attributes.displacement;
                    terrain3D.displacement.dynamic = true;
                    terrain3D.rotation.x = -Math.PI / 2;
                    //console.log(geometry.attributes.displacement);

                    $.ajax({
                        url: "shaders/water.vertex.fx",
                        beforeSend: function (req) {
                            req.overrideMimeType('text/plain; charset=x-shader/x-vertex'); //important - set for binary!
                        },
                        success: function(water_vertex_data){
                            $.ajax({
                                url: "shaders/water.fragment.fx",
                                beforeSend: function (req) {
                                    req.overrideMimeType('text/plain; charset=x-shader/x-fragment'); //important - set for binary!
                                },
                                success: function(water_fragment_data){
                                    terrain3D.water = new THREE.Mesh(
                                        geometry,
                                        new THREE.ShaderMaterial({
                                            uniforms: {
                                                water_level: { type: 'f', value: -1 },
                                                time: { type: 'f', value: 0 }
                                            },
                                            vertexShader: water_vertex_data,
                                            fragmentShader: water_fragment_data,
                                            transparent: true
                                        })
                                    );
                                    terrain3D.water.displacement = geometry.attributes.displacement;
                                    terrain3D.water.displacement.dynamic = true;
                                    terrain3D.water.position.z = -1;
                                    terrain3D.add(terrain3D.water);
                                }
                            }); 
                        }
                    }); 
                }
            }); 
        }
    });
}

function scene3DInitializeClouds()
{
    /* 
    =======================
    Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check http://xhr.spec.whatwg.org/.
    =======================
    */
    /*
    $.ajaxPrefilter(function( options, originalOptions, jqXHR ) {
        options.async = false;
    });
    */
    //=====================

    weatherSkyCloudsMesh =  new THREE.Mesh();
    weatherSkyRainbowMesh = new THREE.Mesh();

    $.ajax({
        url: "shaders/clouds.vertex.fx",
        //async: false,
        beforeSend: function (req) {
            req.overrideMimeType('text/plain; charset=x-shader/x-vertex'); //important - set for binary!
        },
        success: function(vertex_data){
            $.ajax({
                url: "shaders/clouds.fragment.fx",
                //async: false,
                beforeSend: function (req) {
                    req.overrideMimeType('text/plain; charset=x-shader/x-fragment'); //important - set for binary!
                },
                success: function(fragment_data){
                    var fog = new THREE.Fog(0x4584b4, -100, 1000);
                    weatherSkyMaterial = new THREE.ShaderMaterial({
                        uniforms: {
                            "map": {
                                type: "t",
                                //value: texture
                            },
                            "fogColor": {
                                type: "c",
                                value: fog.color
                            },
                            "fogNear": {
                                type: "f",
                                value: fog.near
                            },
                            "fogFar": {
                                type: "f",
                                value: fog.far
                            },
                        },
                        vertexShader: vertex_data,
                        fragmentShader: fragment_data,
                        depthWrite: false,
                        depthTest: false,
                        transparent: true
                    });
                    weatherSkyGeometry = new THREE.Geometry();
                    var plane = new THREE.Mesh(new THREE.PlaneGeometry(4, 4));
                    for (var i = 0; i < 20; i++) 
                    {
                        plane.position.x = getRandomInt(-20, 20);
                        plane.position.y = getRandomInt(5.5, 10);
                        plane.position.z = i;
                        plane.rotation.z = getRandomInt(5, 10);
                        plane.scale.x = plane.scale.y = getRandomInt(0.5, 1);
                        plane.updateMatrix();
                        weatherSkyGeometry.merge(plane.geometry, plane.matrix);
                    }
                    scene3DSetWeather();
                    scene3DSunlight(); //SUNLIGHT RAYS
                }
            }); 
        }
    });
}

function scene3DInitializePhysics()
{
    //http://javascriptjamie.weebly.com/blog/part-1-the-physics
    /*
    physics3D = new CANNON.World();
    physics3D.gravity.set(0, -9.82, 0);
    var physicsMaterial = new CANNON.Material("groundMaterial");
    var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, {
        friction: 0.4,
        restitution: 0.3,
        contactEquationStiffness: 1e8,
        contactEquationRegularizationTime: 3,
        frictionEquationStiffness: 1e8,
        frictionEquationRegularizationTime: 3,
    });
    physics3D.addContactMaterial(physicsContactMaterial);
    //var boxShape = new CANNON.Box(new CANNON.Vec3(1,1,1));
    */
}


function initPanorama(id, files, W,H)
{
    scene3DPanorama = new THREE.Scene();
    camera3DPanorama = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

    rendererPanorama = new THREE.WebGLRenderer({
        devicePixelRatio: window.devicePixelRatio || 1,
        antialias: false
    });

    rendererPanorama.setSize(window.innerWidth*W, window.innerHeight*H);
    document.getElementById(id).appendChild(rendererPanorama.domElement);

    //controls3DPanorama = new THREE.OrbitControls(camera3DPanorama, rendererPanorama.domElement);
    //controls3DPanorama.target = new THREE.Vector3(0, 0, 0);
    //controls3DPanorama.enabled = true;
    
    document.addEventListener( 'mousedown', onPanoramaMouseDown, false );
    document.addEventListener( 'mousewheel', onPanoramaMouseWheel, false );
    document.addEventListener( 'touchstart', onPanoramaTouchStart, false );
    document.addEventListener( 'touchmove', onPanoramaTouchMove, false );

    document.getElementById(id).appendChild(spinner);

    //mouse = new THREE.Vector2();
    //touch = new THREE.Vector2();
    //var scene = new THREE.Object3D();
    //buildPanorama(scene,files, 512, 512);
    //scene3DPanorama.add(scene);

    buildPanorama(scene3DPanorama,files, 1024, 1024, 1024, "_",null);

    document.getElementById(id).removeChild(spinner);

    $('#' + id).show();
    animatePanorama();

    //TODO: update onWindowResize();
}

function initCube(size) {

    var h = size * 0.5;

    geometry = new THREE.Geometry();

    geometry.vertices.push(
        new THREE.Vector3(-h, -h, -h),
        new THREE.Vector3(-h, h, -h),

        new THREE.Vector3(-h, h, -h),
        new THREE.Vector3(h, h, -h),

        new THREE.Vector3(h, h, -h),
        new THREE.Vector3(h, -h, -h),

        new THREE.Vector3(h, -h, -h),
        new THREE.Vector3(-h, -h, -h),


        new THREE.Vector3(-h, -h, h),
        new THREE.Vector3(-h, h, h),

        new THREE.Vector3(-h, h, h),
        new THREE.Vector3(h, h, h),

        new THREE.Vector3(h, h, h),
        new THREE.Vector3(h, -h, h),

        new THREE.Vector3(h, -h, h),
        new THREE.Vector3(-h, -h, h),

        new THREE.Vector3(-h, -h, -h),
        new THREE.Vector3(-h, -h, h),

        new THREE.Vector3(-h, h, -h),
        new THREE.Vector3(-h, h, h),

        new THREE.Vector3(h, h, -h),
        new THREE.Vector3(h, h, h),

        new THREE.Vector3(h, -h, -h),
        new THREE.Vector3(h, -h, h)
    );
    return geometry;
}


