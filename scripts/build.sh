protocol=$1;

if [ "$protocol" ]
then
    graph codegen ./subgraphs/$protocol/${protocol}_subgraph.yaml --output-dir ./subgraphs/$protocol/generated;
    exit 0;
fi

./scripts/prep.sh;