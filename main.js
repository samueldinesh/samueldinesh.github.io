var canvas = document.getElementById("renderCanvas");

        var engine = null;
        var sceneToRender = null;
        var webarStage = null;
        var stageReadyVariable = 0;
        var point =0;
        var life = 3;
        var scaleByFactor = function(obj, factor) {
            obj.scaling.x = obj.scaling.x * factor;
            obj.scaling.y = obj.scaling.y * factor;
            obj.scaling.z = obj.scaling.z * factor;
        }

        var createDefaultEngine = function() { 
            return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); 
        };

        var createScene = function () {
            var scene = new BABYLON.Scene(engine);
            //scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("./models/environment.dds", scene);


            //bippar needs UniversalCamera
            var camera = new BABYLON.UniversalCamera("camera1", new BABYLON.Vector3(0, 0, 0), scene);
            //camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

            //Added for shooting from drone - for dev 
            var gravityVector = new BABYLON.Vector3(0,-9.81, 0);
            var physicsPlugin = new BABYLON.CannonJSPlugin();
            scene.enablePhysics(gravityVector, physicsPlugin);

            var light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(5, 10, -2), scene);
            light.intensity = 0.7;

            // Create an empty webarStage mesh. Models/meshes appended as a children to this webarStage mesh will be displayed on the surface.
            webarStage = new BABYLON.Mesh("webarStage", scene);

            // Create a time varying PBR material for the base cylinder mesh
            /*var pbr = new BABYLON.PBRMaterial("pbr", scene);
            pbr.metallic = 1.0;
            pbr.roughness = 0;
            pbr.subSurface.isRefractionEnabled = true;
            pbr.subSurface.indexOfRefraction = 1.5;
            pbr.subSurface.tintColor = new BABYLON.Color3(0.5, 0, 0);
            var a = 0;
            scene.beforeRender = () => {
                a += 0.05;
                pbr.subSurface.tintColor.g = Math.cos(a) * 0.5 + 0.5;
                pbr.subSurface.tintColor.b = pbr.subSurface.tintColor.g;
            }

            // Create primitive shape using mesh builder and set webarStage as its parent so that it appears on the surface
            var cylinder = BABYLON.MeshBuilder.CreateCylinder("cylinder", {height: 0.1, diameterTop: 1, diameterBottom: 1, tessellation: 128}, scene);
            cylinder.material = pbr;
            cylinder.position.y = 0.125;
            cylinder.position.z = -0.075;
            cylinder.setParent(webarStage);
            
            // Start spark and smoke particles
            startParticles(scene, webarStage);
            */


            // Import a gltf model to the scene and scale appropriately. No need to set the parent to webarStage mesh.
            // All gltf models imported to the scene are created under __root__ node by babylon.
            // After the complete scene is ready, it is models under __root_ node are moved to webarStage mesh
            // to appear on the surface
            //BABYLON.SceneLoader.ImportMesh(['Object_2'], "./models/", "oscar_trophy.glb", scene, function (meshes, particleSystems, skeletons) {
            /*BABYLON.SceneLoader.ImportMesh('', "./models/model/", "drone.babylon", scene, function (meshes, particleSystems, skeletons) {
            
                let xQuat = new BABYLON.Quaternion();
                BABYLON.Quaternion.FromEulerAnglesToRef(Math.PI / 2, 0, 0, xQuat);

                for (mesh of meshes) {
                    if (mesh.name !== '__root__') {
                        // Move the loaded models to webarStage
                        mesh.setParent(webarStage);
                        mesh.rotationQuaternion.multiplyInPlace(xQuat);

                        scaleByFactor(mesh, 0.0375);
                    }
                }
            });*/

            //BABYLON.SceneLoader.ImportMesh("", "./models/model/", "drone.babylon", scene, function (newMeshes) {
            /*BABYLON.SceneLoader.ImportMesh("", "./models/model/", "bee.glb", scene, function (newMeshes) {
                    //var _i=0;
                    //newMeshes[0].setParent(webarStage);


                for (mesh of newMeshes){
                    mesh.setParent(webarStage);
                    //_i += 1;
                    //console.info(_i);
                    //scaleByFactor(mesh, 0.5);
                }
               //var buggy2 = newMeshes[0];
     
               //camera.target = buggy2;
              // buggy2.setParent(webarStage);
       

               //var decalMaterial = new BABYLON.StandardMaterial("decalMat", scene);
               //var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 300, height:15}, scene);
               //ground.material = decalMaterial;	
            });	
            */

            //Added for shooting as gun
           
            var cannonfoot = BABYLON.MeshBuilder.CreateBox("Foot", { width: 1, height: 0.5, depth: 0.4 }, scene);
            //cannonfoot.position.set(-5, 1, 8);// behind me the cannon apprears
            //cannonfoot.position.set(0, -1, 2); //infront canon appears
            
            //cannonfoot.rotation.set(0, 7*Math.PI/8, 0);
            scaleByFactor(cannonfoot, 2);
            
            var cannontube = BABYLON.MeshBuilder.CreateCylinder("Tube", { height: 1, diameter: 0.4, tessellation: 16 }, scene);
            cannontube.position.set(0, 0, 0);
            //scaleByFactor(cannontube, 2);

            var itarg = BABYLON.Mesh.CreateBox("targ", 0.5, scene);
            itarg.position.y = 3;
            itarg.visibility = .1;
            itarg.parent = cannontube;
            //scaleByFactor(itarg, 0.5);


            var objInXRStage = 0;
            if(objInXRStage == 1){
                cannontube.rotation.set(3*Math.PI/2, 0, 0);

                cannontube.parent = cannonfoot; 

                cannonfoot.setParent(webarStage);
                cannonfoot.position.set(0, -1, -2); //infront canon appears

                cannontube.rotation.addInPlace(new BABYLON.Vector3(Math.PI/12, 0, 0));


            }else{           
                cannontube.rotation.set(3*Math.PI/2, 6*Math.PI/2, 0);

                cannontube.parent = cannonfoot; 

                cannonfoot.setParent(camera);
                cannonfoot.position.set(0, -5, 10); //infront canon appears

                cannontube.position.addInPlace(new BABYLON.Vector3(0, 0, 1));
                cannontube.rotation.addInPlace(new BABYLON.Vector3(Math.PI/12, 0, 0));

            }


            // GUI
            var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

            var button1 = BABYLON.GUI.Button.CreateSimpleButton("but1", "Fire");
            button1.width = "150px"
            button1.height = "80px";
            button1.color = "white";
            button1.cornerRadius = 20;
            button1.background = "red";
            button1.onPointerDownObservable.add(function() {
                //alert("you did it!");
                firebullet(power);
               
                console.info("firebullet");
                //castRay();
            });
            button1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM; //move button to bottem end
            button1.top = "-40px"; // move button little over cannonfoot
            advancedTexture.addControl(button1); 

            var rect1 = new BABYLON.GUI.Rectangle();
            rect1.width = 0.2;
            rect1.height = "80px";
            rect1.cornerRadius = 20;
            rect1.color = "Orange";
            rect1.thickness = 4;
            rect1.background = "green";
            rect1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM; //move button to bottem end
            rect1.top = "-40px"; // move button little over cannonfoot
            rect1.left = "-140px"; // move button
            advancedTexture.addControl(rect1);
  

            var label = new BABYLON.GUI.TextBlock();
            label.text = "Smash \n " +point;
            rect1.addControl(label);

            var rect2 = new BABYLON.GUI.Rectangle();
            rect2.width = 0.2;
            rect2.height = "80px";
            rect2.cornerRadius = 20;
            rect2.color = "Orange";
            rect2.thickness = 4;
            rect2.background = "green";
            rect2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM; //move button to bottem end
            rect2.top = "-40px"; // move button little over cannonfoot
            rect2.left = "140px"; // move button
            advancedTexture.addControl(rect2);
  

            var label1 = new BABYLON.GUI.TextBlock();
            label1.text = "Life \n " +life;
            rect2.addControl(label1);
            
    
    
	
            //Hit cannon foot to shoot
            /*
            const boxMaterial = new BABYLON.StandardMaterial("material", scene);
            boxMaterial.diffuseColor = BABYLON.Color3.Random();
            cannonfoot.material = boxMaterial;

            cannonfoot.actionManager = new BABYLON.ActionManager(scene);
            cannonfoot.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, 
                function (evt) {
                    const sourceBox = evt.meshUnderPointer;
                    //sourceBox.position.x += 0.1;
                    //sourceBox.position.y += 0.1;

                    boxMaterial.diffuseColor = BABYLON.Color3.Random();

                    //firebullet(power);
                    //firebullet(power);
                    //firebullet(power);
                    //firebullet(power);
                    //console.info("firebullet fired");
                }));
            */

            // Create the enemies
            //BABYLON.SceneLoader.Load("", "models/model/", "skull.obj", scene, function (newMeshes2, particleSystems2, skeletons2) {
            /*BABYLON.MeshBuilder.CreateCylinder("enemy", { height: 1, diameter: 0.4, tessellation: 16 }, scene, function (newMeshes2, particleSystems2, skeletons2){
                var dude = newMeshes2[0];

                for (var index = 1; index < newMeshes2.length; index++) {
                    shadowGenerator.getShadowMap().renderList.push(newMeshes2[index]);
                }

                for (var count = 0; count < 10; count++) {
                    var offsetX = 200 * Math.random() - 100;
                    var offsetZ = 200 * Math.random() - 100;
                    for (index = 1; index < newMeshes2.length; index++) {
                        var instance = newMeshes2[index].createInstance("instance" + count);

                        shadowGenerator.getShadowMap().renderList.push(instance);

                        instance.parent = newMeshes2[index].parent;
                        instance.position = newMeshes2[index].position.clone();

                        if (!instance.parent.subMeshes) {
                            instance.position.x += offsetX;
                            instance.position.z -= offsetZ;
                        }
                    }
                }

                dude.rotation.y = Math.PI;
                dude.position = new BABYLON.Vector3(0, 0, 0);
                scaleByFactor(dude, 2);
                dude.setParent(camera);

                scene.beginAnimation(skeletons2[0], 0, 100, true, 1.0);
            });
            */

            //next to function works as same
            var randomInteger = function(min, max) { 
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }

            //change the mesh effect // https://playground.babylonjs.com/#1MSIXB#4
            var effectOnMesh = function(enemyObj) {
                var material_base = new BABYLON.StandardMaterial("mat", scene);
                //material_base.diffuseTexture = new BABYLON.Texture("textures/misc.jpg", scene);
                material_base.alpha = 0.9999;		// artificially set the material as alpha blended
                material_base.ambientColor = BABYLON.Color3.White();

                var alphamodes = [
                    BABYLON.Engine.ALPHA_COMBINE,
                    BABYLON.Engine.ALPHA_ADD,
                    BABYLON.Engine.ALPHA_SUBTRACT,
                    BABYLON.Engine.ALPHA_MULTIPLY,
                    BABYLON.Engine.ALPHA_MAXIMIZED
                ];

                var mat = material_base.clone(null);
		        mat.alphaMode = alphamodes[randomInteger(0,5)];
		        enemyObj.material = mat;
                return enemyObj;

            }

            var createEnemy = function(name,x,y,z){
                //var enemyObj = BABYLON.MeshBuilder.CreateCylinder(name, { height: 0.5, diameter: 0.6, tessellation: 16 }, scene);
                var enemyObj = BABYLON.Mesh.CreateCylinder(name, 3, 3, 0, 6, 1, scene, false);
                enemyObj.material = new BABYLON.StandardMaterial("c6mat", scene);
                enemyObj.material.diffuseColor = new BABYLON.Color3(1, 0, 1);
                enemyObj.position.set(x,y,z);
                enemyObj.physicsImpostor = new BABYLON.PhysicsImpostor(enemyObj, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0, friction: 0.5, restition: 0.3 }, scene);
                //enemyObj.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(1, 5, 1));

                //effectOnMesh(enemyObj);
                console.info("enemy created");

                //scaleByFactor(enemyObj, 2);

                return enemyObj;
            }

            var enemy = [];
            for(var i=0; i< 30; i++){
                
                //randomInteger(-5,10)
                enemy[i] = createEnemy("enemy"+i,randomInteger(-20,20),randomInteger(-15,20),-50);
                //en.checkCollision = true;
                enemy[i].setParent(webarStage);
          
                //enemy[i] = createEnemy();
                //webarStage.addChild(createEnemy());
                //scaleByFactor(enemy[i], 2);
                
            }

            // Pass babylon canvas, scene, camera and webarStage mesh to WebarSdk to initialize surface tracking
            WEBARSDK.InitBabylonJs(canvas, scene, camera, webarStage);
            WEBARSDK.SetAutoScale(false);

            

            var power = 10;

            var firebullet = function (power) {
                var bullet = BABYLON.MeshBuilder.CreateSphere("Bullet", { segments: 3, diameter: 0.5}, scene);
                bullet.position = cannontube.getAbsolutePosition();
                //bullet.scale.y += 1.0;
                bullet.isPickable = false; 
                bullet.physicsImpostor = new BABYLON.PhysicsImpostor(bullet, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, friction: 0.5, restition: 0.9 }, scene);
                
                bullet.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(1, 5, 1));
                //scaleByFactor(bullet, 0.4);

                const sphereMaterial = new BABYLON.StandardMaterial("material", scene);
                sphereMaterial.diffuseColor = BABYLON.Color3.Random();
                bullet.material = sphereMaterial;

                //console.info(bullet);

                var dir = itarg.getAbsolutePosition().subtract(cannontube.getAbsolutePosition());
                bullet.physicsImpostor.applyImpulse(dir.scale(power), cannontube.getAbsolutePosition());
                bullet.life = 0
                
                bullet.step = ()=>{
                    bullet.life++
                    if(bullet.life>120 && bullet.physicsImpostor){
                        bullet.physicsImpostor.dispose()
                        bullet.dispose()                
                    }
                }

                bullet.physicsImpostor.onCollideEvent = (e, t)=>{
                    console.info("bullet collide-",e,t)
                    castRay(bullet);
                }

                scene.onBeforeRenderObservable.add(bullet.step)   

                //bullet.checkCollision = true;
                bullet.setParent(webarStage);

            }

            function vecToLocal(vector, mesh){
                var m = mesh.getWorldMatrix();
                var v = BABYLON.Vector3.TransformCoordinates(vector, m);
                return v;		 
            }

            function castRay(obj){       
                var origin = obj.position;
            
                var forward = new BABYLON.Vector3(0,1,1);		
                forward = vecToLocal(forward, obj);
            
                var direction = forward.subtract(origin);
                direction = BABYLON.Vector3.Normalize(direction);
            
                var length = 10;
            
                var ray = new BABYLON.Ray(origin, direction, length);

                let rayHelper = new BABYLON.RayHelper(ray);		
		        rayHelper.show(scene);		


                var hit = scene.pickWithRay(ray);

                if (hit.pickedMesh){
                //hit.pickedMesh.scaling.y += 0.1;
                console.info("hit   picked  ");
                console.log(hit.pickedMesh.name);
                hit.pickedMesh.dispose();
                
                point +=1;


                //hit.pickedMesh.scaling.x += 10
                //var dir = hit.pickedPoint.subtract(scene.activeCamera.position);
                //dir.normalize();
                //hit.pickedMesh.applyImpulse(dir.scale(150), hit.pickedPoint);
 
                }
            }

            for(var i = 0; i < enemy.length; i++)   {
                //setInterval(()=> enemy[i].move("z",8,45),1000);    
                
                //setInterval(()=> enemy[i].position.z +=0.1 ,1000);     

   
            }
            //setInterval(()=> enemy[0].position.z +=8 ,1000);
            
            scene.registerBeforeRender(function (){ 
                if(stageReadyVariable == 1)  {
                    console.info("render before"); 

                    label.text = "Smash \n " +point;
                    label1.text = "Life \n " +life;

                    /*for (var i = 0; i < enemy.length; i++) {
                        moveEnemy(enemy[i]);
                        console.info("enenmy"+i+" before render move");
                    }*/
                        
                    /*try{
                        //const pos_mat  = WEBARSDK.GetCurrentPose();
                        const pos_mat  = WEBARSDK.GetCurrentPosition();
                        console.info("Pose Matrix", 
                        pos_mat[0],  pos_mat[1],  pos_mat[2],  pos_mat[3], "\n",
                        pos_mat[4],  pos_mat[5],  pos_mat[6],  pos_mat[7], "\n",
                        pos_mat[8],  pos_mat[9],  pos_mat[10], pos_mat[11], "\n",
                        pos_mat[12], pos_mat[13], pos_mat[14], pos_mat[15]);

                        const rot_mat = WEBARSDK.GetCurrentRotation();
                        console.info("Pure Rotation Matrix", 
                        pos_mat[0],  pos_mat[1],  pos_mat[2],  pos_mat[3], "\n",
                        pos_mat[4],  pos_mat[5],  pos_mat[6],  pos_mat[7], "\n",
                        pos_mat[8],  pos_mat[9],  pos_mat[10], pos_mat[11], "\n",
                        pos_mat[12], pos_mat[13], pos_mat[14], pos_mat[15]);
                    }
                    catch(err){
                        console.error("Error-",err);
                    }
                    */
                }
            });

            var enemyMoveInterval = 60; // enemy moves every 60 frames
        var enemyMoveCountdown = enemyMoveInterval;
        var enemySpeed = 0.1; // enemy moves 0.1 units per frame

        var moveEnemy = function(enemyObj) {
        enemyObj.position.z += enemySpeed;
        if (enemyMoveCountdown <= 0) {
            // move enemy in a random direction
            var x = (Math.random() - 0.5) * 2 * 10; // move in range of -10 to 10 in x direction
            var y = (Math.random() - 0.5) * 2 * 10; // move in range of -10 to 10 in y direction
            enemyObj.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(x, y, enemySpeed));
            enemyMoveCountdown = enemyMoveInterval;
        } else {
            enemyMoveCountdown--;
        }
        };

        // update enemy positions at every frame


            var moveEnemy1 = function(enemy) {
                var maxDist = 20;
                var minDist = 10;
                var moveSpeed = 0.05;
                var angleSpeed = 0.02;
                
                var x = enemy.position.x + Math.random() * moveSpeed - moveSpeed / 2;
                var y = enemy.position.y;
                var z = enemy.position.z + Math.random() * moveSpeed - moveSpeed / 2;
                
                var distance = Math.sqrt((x - cannontube.position.x) * (x - cannontube.position.x) + (y - cannontube.position.y) * (y - cannontube.position.y) + (z - cannontube.position.z) * (z - cannontube.position.z));
                
                if (distance > maxDist) {
                    x = enemy.position.x + (cannontube.position.x - enemy.position.x) * moveSpeed / distance;
                    z = enemy.position.z + (cannontube.position.z - enemy.position.z) * moveSpeed / distance;
                }
                else if (distance < minDist) {
                    x = enemy.position.x - (cannontube.position.x - enemy.position.x) * moveSpeed / distance;
                    z = enemy.position.z - (cannontube.position.z - enemy.position.z) * moveSpeed / distance;
                }
                
                var dx = x - enemy.position.x;
                var dz = z - enemy.position.z;
                var angle = Math.atan2(dz, dx);
                var diff = angle - enemy.rotation.y;
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;
                if (Math.abs(diff) > angleSpeed) {
                    var sign = diff > 0 ? 1 : -1;
                    enemy.rotation.y += sign * angleSpeed;
                }
                else {
                    enemy.rotation.y = angle;
                }
                
                enemy.position.set(x, y, z);
                
                if (cannontube.intersectsMesh(enemy, true)) {
                    // reduce player health
                    console.info("enemy intersect");
                }
            }
            
            scene.registerAfterRender(function() {
                /*for (var i = 0; i < enemy.length; i++) {
                    moveEnemy(enemy[i]);
                    console.info("enenmy"+i+" After render move");
                }*/
            });
            
                return scene;
        };

        var sparksystem = null;
        var smokesystem = null;

        var startParticles = function (scene, fountain) {
            let sphereSpark = BABYLON.MeshBuilder.CreateSphere("sphereSpark", {diameter: 0.4, segments: 32}, scene);
            sphereSpark.isVisible = false;
            sphereSpark.setParent(fountain);
            BABYLON.ParticleHelper.ParseFromFileAsync(null, "./models/spark_particles.json", scene, false).then(system => {
                sparksystem = system;
                system.emitter = sphereSpark;
            });
            let sphereSmoke = BABYLON.MeshBuilder.CreateSphere("sphereSmoke", {diameter: 1.9, segments: 32}, scene);
            sphereSmoke.isVisible = false;
            sphereSmoke.setParent(fountain);
            BABYLON.ParticleHelper.ParseFromFileAsync(null, "./models/smoke_particles.json", scene, false).then(system => {
                smokesystem = system;
                system.emitter = sphereSmoke;
            });
        };

        window.initFunction = async function() {
            var asyncEngineCreation = async function() {
                try {
                    return createDefaultEngine();
                } catch(e) {
                console.log("the available createEngine function failed. Creating the default engine instead");
                    return createDefaultEngine();
                }
            }

            window.engine = await asyncEngineCreation();
            if (!engine) throw 'engine should not be null.';
            window.scene = createScene();
        };

        initFunction().then(() => {
            sceneToRender = window.scene;
            sceneToRender.executeWhenReady(function () {
                engine.runRenderLoop(function () {
                    if (sceneToRender && sceneToRender.activeCamera) {
                        sceneToRender.render();
                    }
                });
            });
        });

        window.addEventListener("resize", function () {
            engine.resize();
        });

        WEBARSDK.SetStageReadyCallback(() => {
            console.info('Stage is ready now!!!');
            stageReadyVariable = 1;
            /*
            // Start spark and smoke particles
            var toggleCounter = 0;
            setInterval(() => {
                console.log('Restart spark');

                if (toggleCounter % 2 === 0) {
                    if (sparksystem !== null) {
                        sparksystem.stop();
                        sparksystem.reset();
                        sparksystem.start()
                    }
                }
                else {
                    if (smokesystem !== null) {
                        smokesystem.stop();
                        smokesystem.reset();
                        smokesystem.start();
                    }
                }

                ++toggleCounter;
            },
            3000);
            */
        });