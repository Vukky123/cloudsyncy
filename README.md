# cloudsyncy
Sync files from local to cloud and cloud to local. (in other words, copies files from one folder to another)

## Config format
Each configuration is its own object.
```json
"configname": {},
"configname2": {},
"minecraft": {}
```
The name of the object will be used as the name in cloudsyncy.

### Configuration options

`overwriteExisting` (boolean) - Whether to overwrite existing files during copying.

`deleteDestinationContentsBeforeCopy` (boolean) - Whether to delete the files in the destination folder before copying.

`local` (array) - A list of folders that are considered the "local" folders.

`cloud` (array) - A list of folders that are considered the "cloud" folders.

`ignoreLocal` (array) - A list of folders to ignore when copying files from local to cloud.

`ignoreCloud` (array) - A list of folders to ignore when copying files from cloud to local.

## But why?
Yeah Idunno. I didn't like repeatedly downloading Minecraft mods and resource packs across machines.
