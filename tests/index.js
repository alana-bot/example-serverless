test('hello world', function() {
    return newTest()
        .expectText('📢 🤖')
        .sendText('hello')
        .expectText('hello world')
        .run();
})

test('echo', function() {
    return newTest()
        .expectText('📢 🤖')
        .sendText('echo')
        .expectText('echo')
        .expectText('echo')
        .expectText('echo')
        .run();
})

test('random', function() {
    return newTest()
        .expectText('📢 🤖')
        .sendText('random text')
        .expectText('random text')
        .run();
})
