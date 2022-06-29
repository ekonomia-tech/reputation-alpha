
if [ -d "./main" ] 
then
    rm -rf "./main";
fi

mkdir "./main";
mkdir "./main/src";
mkdir "./main/abis";

yaml="./main/subgraph.yaml"

touch $yaml;

echo "specVersion: 0.0.4" >> ./main/subgraph.yaml;
echo "description: Reputation Subgraphs" >> ./main/subgraph.yaml;
echo "repository: https://github.com/ekonomia-tech/reputation-alpha" >> ./main/subgraph.yaml;
echo "schema:" >> ./main/subgraph.yaml;
echo "  file: ../schema.graphql" >> ./main/subgraph.yaml;
echo "dataSources:" >> ./main/subgraph.yaml;

touch "./main/datasources_temp.yaml";
touch "./main/templates_temp.yaml";

for d in ./subgraphs/*; do
    ## Create needed directories
    name=${d##*/};

    # if [ $name == "compound" ]; 
    # then 
    #     continue; 
    # fi
    mkdir ./main/src/$name;

    ## check if prices exists and if not copy form first iteration
    if ! [ -d ./main/src/Prices ]
    then
        cp -r $d/src/Prices ./main/src/;
    fi

    cp -a -n $d/abis/. ./main/abis
    ## copy mapping and helpers
    cp -r $d/src/mappings ./main/src/${name}/mappings;
    cp -r $d/src/helpers ./main/src/${name}/helpers;
    
    ## copy datasources
    line_count=0;

    cat $d/${name}_subgraph.yaml | 
    while read; 
    do
        if [[ "$REPLY" == *"templates"* ]]
        then
            break
        fi

        if [ $line_count -lt 6 ]; 
        then
            ((line_count=line_count+1));
            continue;
        fi

        if [[ "$REPLY" == *"mappings"* ]]
        then
            
            echo "${REPLY/mappings/$name/mappings}" >> ./main/datasources_temp.yaml;
        else 
            echo "$REPLY" >> ./main/datasources_temp.yaml;
        fi
    done
    

    ## copy templates
    templates_encountered=0;

    cat $d/${name}_subgraph.yaml | 
    while read; 
    do

        if [[ "$REPLY" == *"templates"* ]]
        then
            ((templates_encountered=1));
            continue;
        fi

        if [ "$templates_encountered" = 0 ]
        then
            continue;
        else 
         if [[ "$REPLY" == *"mappings"* ]]
            then
                
                echo "${REPLY/mappings/$name/mappings}" >> ./main/templates_temp.yaml;
            else 
                echo "$REPLY" >> ./main/templates_temp.yaml;
            fi
        fi
    done

done;

cat "./main/datasources_temp.yaml" |
while read;
do
    echo "$REPLY" >> $yaml;
done

echo "templates:" >> $yaml;

cat "./main/templates_temp.yaml" |
while read;
do
    echo "$REPLY" >> $yaml;
done

rm "./main/templates_temp.yaml";
rm "./main/datasources_temp.yaml";

## change generated paths

search="generated";
replace="../generated";


find ./main/src/*/* -type f ! -path "./main/src/Prices/*" -exec sed -i '' 's/generated/..\/generated/g' {} +
find ./main/src/*/* -type f -exec sed -i '' 's/Prices/..\/Prices/g' {} +

cd main && graph codegen
