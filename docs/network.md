# Network Document Access

Out of the box, LOWA cannot transparently access documents over the network.  Specifying something
like
```
Module.arguments = ['https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_100KB_ODT.odt'];
```
to open a Writer document from the Web will fail.

However, there are at least two ways to work around that, see the [Emscripten Networking
documentation](https://emscripten.org/docs/porting/networking.html):

## Access Over the WebSocket Protocol

One way is to tell Emscripten to internally emulate HTTP/HTTPS access via the WebSocket protocol,
via a `Module.websocket` setting.  If the target server does not itself support the WebSocket
protocol, you can use something like [websockify](https://github.com/novnc/websockify) as a proxy.
For example, to make the above scenario work this way, set
```
Module.websocket = {url: 'ws://127.0.0.1:6932', subprotocol: 'binary'};
Module.arguments = ['https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_100KB_ODT.odt'];
```
in your application's HTML file before including `soffice.js`, and run a `websockify` proxy on local port 6932, which forwards to the `freetestdata.com` HTTPS port:
```
$ websockify 127.0.0.1:6932 freetestdata.com:443
```

One downside of this approach is that it can only connect to a single WebSocket endpoint.

## Access Via a Proxy Server

Another way is to use a LOWA build configured with `--enable-emscripten-proxy-posix-sockets`, which
requires an external process over which all low-level network access is proxied.  Emscripten
provides the code for such a proxy executable, build it with e.g.,
```
$ g++ ${EMSCRIPTEN-${EMSDK\?}/upstream/emscripten}/tools/websocket_to_posix_proxy/src/*.{c,cpp} -o websocket_to_posix_proxy
```
in the emsdk.

To make the above scenario work this way, set
```
Module.uno_websocket_to_posix_socket_url = 'ws://127.0.0.1:6932';
Module.arguments = ['https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_100KB_ODT.odt'];
```
in your application's HTML file before including `soffice.js`, and run the
`websocket_to_posix_proxy` proxy on local port 6932:
```
$ websocket_to_posix_proxy 6932
```

This requires that LOWA and the `websocket_to_posix_proxy` are built with an emsdk that carries
fixes for the two Emscripten issues [getsockopt mismatch in websocket_to_posix_proxy vs.
_socket](https://github.com/emscripten-core/emscripten/pull/22432) and [Fix computation of size to
send in getsockname in
websocket_to_posix_socket.c](https://github.com/emscripten-core/emscripten/pull/22433), and the
Emscripten improvement [-sPROXY_POSIX_SOCKETS: Add
websocket_proxy_poll](https://github.com/stbergmann/emscripten/commit/4aff1f28b88480791236adcc6d5cb2d919ad4bf3).

## HTTPS Support

For both of the above approaches, LOWA also needs a certificate file for its OpenSSL implementation.
Such a file does not come preinstalled in the LOWA virtual file system, but there is steps to
include one in your application:

See the [list of GetCABundleFile
candidates](https://git.libreoffice.org/core/+/refs/heads/master/include/systools/opensslinit.hxx)
that LOWA looks for.  If, for any of those candidates, you have a matching file on your host, e.g.,
`/etc/pki/tls/certs/ca-bundle.crt`, then you can add a copy of it to LOWA's virtual file system by
running e.g.
```
$ ${EMSCRIPTEN-${EMSDK?}/upstream/emscripten}/tools/file_packager.py include.data --js-output=cert.js --embed /etc/pki/tls/certs/ca-bundle.crt@/etc/pki/tls/certs/ca-bundle.crt
```
in the emsdk and including the generated `cert.js` in your application's HTML file before including
`soffice.js`.
