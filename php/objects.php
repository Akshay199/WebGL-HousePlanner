<?php

require('database.php');
 
if(isset($_FILES['file']) and !$_FILES['file']['error'])
{
    /*
    Note: You will run into errors or blank page if "memory_limit" or "upload_max_filesize" is set to low in "php.ini".
    Open "php.ini" file, and search for "memory_limit" or "upload_max_filesize" limit and set them, also check "post_max_size".
    */
   
    if (!isset($_SERVER['HTTP_X_REQUESTED_WITH'])) //check if this is an ajax request
    {
        die();
    }
    
    switch(strtolower($_FILES['file']['type'])) //allowed file type Server side check
    {
        //allowed file types
 		case 'application/zip':
        case 'application/octet-stream':
            break;
        default:
            die('Unsupported File!'); //output error
    }
   
    $File_Name          = strtolower($_FILES['file']['name']);
    $File_Ext           = substr($File_Name, strrpos($File_Name, '.')); //get file extention
    $Random_Number      = rand(0, 9999999999); //Random number to be added to name.
    $NewFileName        = $Random_Number.$File_Ext; //new file name

    if ($_POST['upload'] == 'scene')
    {
        if(move_uploaded_file($_FILES['file']['tmp_name'], '/home/website/houseplanner/scene/' . $NewFileName ))
        {
   
        }
    }
}
else
{
    //header("Content-type: text/xml");
    //$xml = new SimpleXMLElement('<xml></xml>');

    header("Content-type: text/json");
    $json=array();

    $pdo = new PDO(DB_DRIVER . ":host=" . DB_SERVER . ";dbname=" . DB_DATABASE, DB_USERNAME, DB_PASSWORD);

	if (isset($_GET['id']))
    {
    	$sql = "SELECT * FROM OBJECTS WHERE ID = :id";
        $query = $pdo->prepare($sql);
        $query->bindValue(":id", $_GET['id']);

        if($query->execute())
        {
        	$row = $query->fetch(PDO::FETCH_ASSOC);

            $json=array('file'=>$row["FILE"]);
        }
    }
	else if (isset($_GET['objects']))
    {
        //$xml->addAttribute('menu', $_GET['id']);

        $sql = "SELECT * FROM OBJECTS WHERE CATEGORY_ID = :objects";
        $query = $pdo->prepare($sql);
        $query->bindValue(":objects", $_GET['objects']);

        if($query->execute())
        {
            $result = $query->fetchALL(PDO::FETCH_ASSOC);

            $items=array();
            foreach($result as $row)
            {
            	array_push($items, array('name'=>$row["NAME"],'image'=>$row["IMAGE"],'file'=>$row["ID"],'manufacturer'=>null,'model'=>null,'store'=>null,'price'=>null));
            }
            $json=array('menu'=>$items);
        }
    }
    else if (isset($_GET['menu']))
    {
        //$xml->addAttribute('menu', 'test');
        $sql = "SELECT * FROM CATEGORIES WHERE ID > 0 AND NAME = :menu"; // SUB_ID = 0";
        $query = $pdo->prepare($sql);
        $query->bindValue(":menu", $_GET['menu']);

    	if($query->execute())
    	{
    		$row = $query->fetch(PDO::FETCH_ASSOC);

                //echo $row["ID"];

                $sql = "SELECT * FROM CATEGORIES WHERE SUB_ID = :id ORDER BY CATEGORIES.ORDER ASC";
                $query = $pdo->prepare($sql);
                $query->bindValue(":id", $row["ID"]);

                $items=array();

                if($query->execute())
                {
                    $result = $query->fetchALL(PDO::FETCH_ASSOC);

                    if(count($result) > 0)
                    {
                        foreach($result as $row)
                        {
                            $sql = "SELECT * FROM CATEGORIES WHERE SUB_ID = :id ORDER BY CATEGORIES.ORDER ASC";
                            $query = $pdo->prepare($sql);
                            $query->bindValue(":id", $row["ID"]);

                            if($query->execute())
                            {   
                                $result2 = $query->fetchALL(PDO::FETCH_ASSOC);
                                if(count($result2) > 0)
                                {
                                    $submenu=array();
                                    foreach($result2 as $row2)
                                    {
                                        array_push($submenu, array('name'=>$row2["NAME"],'link'=>$row2["ID"],'sub'=>NULL));
                                    }
                                    array_push($items, array('name'=>$row["NAME"],'link'=>NULL,'sub'=>$submenu));
                                }else{
                                    array_push($items, array('name'=>$row["NAME"],'link'=>$row["ID"],'sub'=>NULL));
                                }
                            }
                        }
                    }
                    else
                    {
                        $menu=array('name'=>$row["NAME"],'link'=>$row["ID"]);
                    }
                }

            $json=array('menu'=>$items);
    	}
    }

    echo json_encode($json, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); //$array = json_decode($json,TRUE);
    //echo $xml->asXML();
}
?>
