function create(token, name) {
    NOSQL('tokens').insert({ token: token, name: name, created: F.datetime }, true).where('token', token);
}

// For test only
create('d88ad6cd-1112-4fc9-a20a-6ff75ed4d2da', 'Android');
create('5df4b659-bc1d-4e4d-9e37-0fa2ad70f8d1', 'iOS');