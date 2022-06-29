protocol=$1;

if [ "$protocol" ]
then
    graph codegen ./subgraphs/$protocol/${protocol}_subgraph.yaml --output-dir ./subgraphs/$protocol/generated;
    graph deploy --product hosted-service nmimran99/$protocol ./subgraphs/$protocol/${protocol}_subgraph.yaml --output-dir ./subgraphs/$protocol/build;
    exit 0;
fi

./scripts/prep.sh;
graph deploy --product hosted-service nmimran99/defi-subgraphs ./main/subgraph.yaml --output-dir ./main;
rm -rf ./main;