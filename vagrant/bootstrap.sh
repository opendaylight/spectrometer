#!/bin/bash
# vim: ts=4 sw=4 sts=4 et tw=72 :

function install_centos {
    echo "---> Updating operating system"
    yum clean all -q && yum upgrade -y
    curl -O https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
    yum install -y epel-release-latest-7.noarch.rpm
    rm epel-release-latest-7.noarch.rpm

    echo "---> Installing Spectrometer dependencies"
    yum install -y -q git mongodb-server python34 python34-setuptools
    easy_install-3.4 pip
    pip3 install virtualenv

    echo "---> Cleanup"
    yum clean all
}

# determine what user (distro)
ORIGIN=$(logname)

case "${ORIGIN}" in
    centos)
        install_centos
        ;;
    *)
        echo "${ORIGIN} is not supported at this time" >&2
        ;;
esac
