package fs

import (
	"io"
	"k8s.io/klog/v2"
	kpath "k8s.io/utils/path"
	s32 "kubesphere.io/openpitrix/pkg/client/s3"
	"os"
	"path/filepath"
	"strings"
)

var path = "/root/charts"

type Client struct {
}

func (c *Client) Upload(key, fileName string, body io.Reader, size int) error {

	f, err := os.Create(formatterPath(key))
	if err != nil {
		klog.Errorf("create file failed %s, error: %s", formatterPath(key), err)
		return err
	}
	var read []byte
	read, err = io.ReadAll(body)
	if err != nil {
		return err
	}
	_, err = f.Write(read)
	if err != nil {
		klog.Errorf("write to file failed %s, error: %s", formatterPath(key), err)
		return err
	}
	defer f.Close()
	//TODO implement me
	return nil
}

func (c *Client) GetDownloadURL(key string, fileName string) (string, error) {
	//TODO implement me
	return "", nil
}

func (c *Client) Delete(key string) error {
	//TODO implement me
	exists, err := kpath.Exists(kpath.CheckFollowSymlink, formatterPath(key))
	if err != nil {
		return err
	}
	if !exists {
		return nil
	}
	err = os.Remove(formatterPath(key))
	if err != nil {
		klog.Errorf("delete file %s failed, error: %s", formatterPath(key), err)
		return err
	}
	return nil
}

func (c *Client) Read(key string) ([]byte, error) {
	file, err := os.Open(formatterPath(key))
	if err != nil {
		klog.Errorf("open file %s failed, error: %s", formatterPath(key), err)
		return nil, err
	}
	var all []byte
	all, err = io.ReadAll(file)
	if err != nil {
		klog.Errorf("read file %s info failed, error: %s", formatterPath(key), err)
		return nil, err
	}
	return all, nil
}

func NewFsClient(options *s32.Options) (s32.Interface, error) {
	if strings.TrimSpace(options.FilePath) != "" && len(strings.TrimSpace(options.FilePath)) > 0 {
		path = options.FilePath
	}
	if exists, err := kpath.Exists(kpath.CheckFollowSymlink, path); err != nil {
		klog.Errorf("check dir %s failed, error: %s", path, err)
		return nil, err
	} else if !exists {
		err = os.Mkdir(path, os.ModeDir|os.ModePerm)
		if err != nil {
			klog.Errorf("mkdir %s failed, error: %s", path, err)
			return nil, err
		}
	}
	var c Client
	return &c, nil
}

func formatterPath(p string) string {
	if strings.Index(p, "/") > -1 {
		return filepath.Join(path, strings.Replace(p, "/", "-", 1))
	}
	return filepath.Join(path, p)
}
